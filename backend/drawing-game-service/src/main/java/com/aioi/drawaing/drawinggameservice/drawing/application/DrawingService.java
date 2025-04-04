package com.aioi.drawaing.drawinggameservice.drawing.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundInfo;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundResult;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.Timer;
import com.aioi.drawaing.drawinggameservice.drawing.domain.*;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.KeywordRepository;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.RoomSesseionRepository;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.SessionRepository;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.AuthServiceClient;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.request.GameResultRequest;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.request.MemberExpUpdateRequest;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.response.AuthResponse;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.DrawMessagePublisher;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.AddSessionParticipantInfo;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.DrawInfo;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.WinParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DrawingService {
    private final DrawMessagePublisher drawMessagePublisher;
    private final Map<String, AtomicInteger> remainTime=new ConcurrentHashMap<>();; //type(session, draw)+sessionId
    private final Map<String, ScheduledFuture<?>> scheduledFutures=new ConcurrentHashMap<>(); //type(session, draw)+sessionId
    private final ScheduledExecutorService schedule;
    private final KeywordRepository keywordRepository;
    private final SessionRepository sessionRepository;
    private final AuthServiceClient authServiceClient;
    private final int DEFAULT_WORD_COUNT = 30;
    private final int DEFAULT_SESSION_TIMER = 30; //600;
    private final int DEFAULT_DRAW_TIMER = 20;
    private final int MAX_PARTICIPANT_NUMBER = 4;

    //세션 시작
    //세션 시작할 때, 게임 제시어 주기
    //세션 시작할 때, 타이머 시작 + 전달
    //세션 시작할 때, 게임 어떻게 할건지 의논 필요
    public void startSession(String roomId, String sessionId, List<AddRoomParticipantInfo> addParticipantInfos) {
        List<String> words = extractWords(DEFAULT_WORD_COUNT);
        log.info("startSession: {}", sessionId);
        Session session = findSession(sessionId);

        session.updateSessionStartInfo(words, addParticipantInfos);
        sessionRepository.save(session);
        startTimers(roomId, sessionId, DEFAULT_SESSION_TIMER, DEFAULT_DRAW_TIMER);
        drawMessagePublisher.publishRoundInfo("/topic/session.info/"+roomId+"/"+sessionId, new RoundInfo(words, session.getParticipants()));
    }

    public Session createSession(String roomId) {
        Session session = Session.createSession(roomId);
        return sessionRepository.save(session);
    }

    public void sendDraw(String roomId, String sessionId, HashMap<Long, List<DrawInfo>> drawInfo){
        drawMessagePublisher.publishDraw("/topic/session.draw/" + roomId + "/" + sessionId, drawInfo);
    }

//    private void startTimers(String roomId, String sessionId) {
//        publishSessionTimer(roomId, sessionId, DEFAULT_SESSION_TIMER);
//        publishDrawingTimer(roomId, sessionId, DEFAULT_DRAW_TIMER);
//    }

    //게임 제시어 뽑기
    public List<String> extractWords(int count) {
        List<Keyword> keywords = keywordRepository.findAll();
        return ThreadLocalRandom.current()
                .ints(0, keywords.size())
                .distinct()
                .limit(Math.min(count, keywords.size()))
                .mapToObj(keywords::get)
                .map(Keyword::getKeyword)
                .collect(Collectors.toList());
    }

//    public void increaseRound(String sessionId){
//        Session session = findSession(sessionId);
//        session.incrementRoundCount();
//        sessionRepository.save(session);
//    }

    public void startTimers(String roomId, String sessionId, int sessionInitTime, int drawInitTime){
        String sessionKey = getKey(TimeType.SESSION, sessionId);
        String drawKey = getKey(TimeType.DRAWING, sessionId);

        remainTime.put(sessionKey, new AtomicInteger(sessionInitTime));
        remainTime.put(drawKey, new AtomicInteger(drawInitTime));

        ScheduledFuture<?> scheduledFuture = schedule.scheduleAtFixedRate(()->{
            int sessionTime = remainTime.get(sessionKey).decrementAndGet();
            int drawTime = remainTime.get(drawKey).decrementAndGet();

            log.info("sessionTime: {} drawTime: {}", sessionTime, drawTime);

            if(sessionTime<=0){
                remainTime.remove(sessionKey);
                endSession(roomId, sessionId);
                stopTimer(sessionKey);
                stopTimer(drawKey);

            }

            if(drawTime<=0){
                remainTime.put(drawKey, new AtomicInteger(drawInitTime));
            }

            drawMessagePublisher.publishTimer("/topic/session.timer/"+roomId+"/"+sessionId, new Timer(sessionTime, drawTime));

        }, 0,1,TimeUnit.SECONDS);

        scheduledFutures.put(sessionKey, scheduledFuture);
    }

    public void resetDrawingTimer(String sessionId) {
        String key = getKey(TimeType.DRAWING, sessionId);
        remainTime.put(key, new AtomicInteger(DEFAULT_DRAW_TIMER));
    }

    private void endSession(String roomId, String sessionId){
        Session session = findSession(sessionId);
        log.info("endSession: {}", sessionId);

//        try {
//            AuthResponse win = authServiceClient.updateRanking(new GameResultRequest(1L, "WIN", 10));
//            log.info(win.data());
//            AuthResponse authResponse = authServiceClient.updateMemberExp(new MemberExpUpdateRequest(1L, 10, 10));
//            log.info(authResponse.data());
//        } catch (FeignException e) {
////            log.error(e.getMessage());
//            log.error("❌ Feign 요청 실패: {}", e.getMessage(), e); // ✅ 올바른 로깅 방식
//            throw new RuntimeException(e);
//        }

        drawMessagePublisher.publishGameResult("/topic/session.result/"+roomId+"/"+sessionId, session.toParticipantScoreInfo());
    }

    private void addParticipant(Session session, AddSessionParticipantInfo addSessionParticipantInfo) {
        session.addParticipant(addSessionParticipantInfo.id(), Participant.createParticipant(addSessionParticipantInfo.nickname(), addSessionParticipantInfo.characterUrl()));
    }

    public Session findSession(String sessionId) {
        return sessionRepository.findById(sessionId).orElseThrow(()->new RuntimeException("session id가 잘못됐습니다."));
    }

    private String getKey(TimeType timeType, String sessionId) {
        return timeType.name()+":"+sessionId;
    }

    private void stopTimer(String key){
        scheduledFutures.get(key).cancel(true);
    }

    public void win(String roomId, String sessionId, WinParticipantInfo winParticipantInfo) {
        Session session = findSession(sessionId);
        int correctScore = plusCorrectScore(sessionId, winParticipantInfo.drawingOrder());
        int drawScore = plusDrawScore(winParticipantInfo.drawingOrder());
//        System.out.println(correctScore+" "+drawScore);
        session.win(winParticipantInfo, correctScore, drawScore);
//        System.out.println(session.getHumanWin());
        sessionRepository.save(session);
        drawMessagePublisher.publishRoundResult("/topic/session.round-result/"+roomId+"/"+sessionId, new RoundResult(true, session.getRoundCount()));
    }

    public void lose(String roomId, String sessionId){
        Session session = findSession(sessionId);
        session.incrementRoundCount();
        sessionRepository.save(session);
        drawMessagePublisher.publishRoundResult("/topic/session.round-result/"+roomId+"/"+sessionId, new RoundResult(false, session.getRoundCount()));
    }

    private int plusDrawScore(int drawingOrder) {
        return (MAX_PARTICIPANT_NUMBER-drawingOrder)*5;
    }

    private int plusCorrectScore(String sessionId, int drawingOrder) {
        int totalRoundTime=DEFAULT_DRAW_TIMER*3;
        int roundTime=remainTime.get(getKey(TimeType.DRAWING, sessionId)).get()+DEFAULT_DRAW_TIMER*drawingOrder;
        return (totalRoundTime-roundTime)/3;
    }
}
