package com.aioi.drawaing.drawinggameservice.drawing.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundInfo;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.Timer;
import com.aioi.drawaing.drawinggameservice.drawing.domain.*;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.KeywordRepository;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.RoomSesseionRepository;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.SessionRepository;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.AddSessionParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawingService {
    private final DrawMessagePublisher drawMessagePublisher;
    private final Map<String, AtomicInteger> remainTime=new ConcurrentHashMap<>();; //type(session, draw)+sessionId
    private final Map<String, ScheduledFuture<?>> scheduledFutures=new ConcurrentHashMap<>(); //type(session, draw)+sessionId
    private final ScheduledExecutorService schedule;
    private final KeywordRepository keywordRepository;
    private final RoomSesseionRepository roomSesseionRepository;
    private final SessionRepository sessionRepository;
    private final int DEFAULT_WORD_COUNT = 30;
    private final int DEFAULT_SESSION_TIMER = 60;
    private final int DEFAULT_DRAW_TIMER = 3;
    //세션 시작
    //세션 시작할 때, 게임 제시어 주기
    //세션 시작할 때, 타이머 시작 + 전달
    //세션 시작할 때, 게임 어떻게 할건지 의논 필요
    public void startSession(String roomId, String sessionId, List<AddRoomParticipantInfo> addParticipantInfos) {
        List<String> words = extractWords(DEFAULT_WORD_COUNT);
        System.out.println("startSession: "+sessionId);
        Session session = findSession(sessionId);

        session.updateSessionStartInfo(words, addParticipantInfos);
        startTimers(roomId, sessionId);
        drawMessagePublisher.publishRoundInfo("/topic/session.info/"+roomId+"/"+sessionId, new RoundInfo(words, session.getParticipants()));
    }

    public Session createSession(String roomId) {
        Session session = Session.createSession(roomId);
        return sessionRepository.save(session);
    }

    private void startTimers(String roomId, String sessionId) {
        publishSessionTimer(roomId, sessionId, DEFAULT_SESSION_TIMER);
        publishDrawingTimer(roomId, sessionId, DEFAULT_DRAW_TIMER);
    }

    //게임 제시어 뽑기
    public List<String> extractWords(int count) {
        List<Keyword> keywords = keywordRepository.findAll();
        return ThreadLocalRandom.current()
                .ints(0, keywords.size())
                .distinct()
                .limit(count)
                .mapToObj(keywords::get)
                .map(Keyword::getKeyword)
                .collect(Collectors.toList());
    }

    public void increaseRound(String sessionId){
        Session session = findSession(sessionId);
        session.incrementRoundCount();
        sessionRepository.save(session);
    }

    public void publishSessionTimer(String roomId, String sessionId, int startTime) {
        String sessionKey = getKey(TimeType.SESSION, sessionId);
        String drawKey = getKey(TimeType.DRAWING, sessionId);

        remainTime.put(sessionKey, new AtomicInteger(startTime));

        ScheduledFuture<?> scheduledFuture = schedule.scheduleAtFixedRate(()->{
            int time = remainTime.get(sessionKey).decrementAndGet();
            if(remainTime.get(sessionKey).intValue()<=0){
                remainTime.remove(sessionKey);
                stopTimer(sessionKey);
                stopTimer(drawKey);
            }
            drawMessagePublisher.publishTimer("/topic/session.total-timer/"+roomId+"/"+sessionId, new Timer(time));

        }, 0,1,TimeUnit.SECONDS);

        scheduledFutures.put(sessionKey, scheduledFuture);
    }

    public void publishDrawingTimer(String roomId, String sessionId, int startTime) {
        String key = getKey(TimeType.DRAWING, sessionId);
        remainTime.put(key, new AtomicInteger(startTime));

        ScheduledFuture<?> scheduledFuture = schedule.scheduleAtFixedRate(()->{
            int time = remainTime.get(key).decrementAndGet();
            if(remainTime.get(key).intValue()<=0){
                remainTime.put(key, new AtomicInteger(startTime));
            }
            drawMessagePublisher.publishTimer("/topic/session.draw-timer/"+roomId+"/"+sessionId, new Timer(time));

        }, 0,1,TimeUnit.SECONDS);

        scheduledFutures.put(key, scheduledFuture);
    }

    public void resetDrawingTimer(String sessionId, int drawTimer) {
        String key = getKey(TimeType.DRAWING, sessionId);
        remainTime.put(key, new AtomicInteger(drawTimer));
    }

    private void addParticipant(Session session, AddSessionParticipantInfo addSessionParticipantInfo) {
        session.addParticipant(addSessionParticipantInfo.id(), Participant.createParticipant(addSessionParticipantInfo.nickname(), addSessionParticipantInfo.characterUrl()));
    }

    private Session findSession(String sessionId) {
        return sessionRepository.findById(sessionId).orElseThrow(()->new RuntimeException("session id가 잘못됐습니다."));
    }

    private String getKey(TimeType timeType, String sessionId) {
        return timeType.name()+":"+sessionId;
    }

    private void stopTimer(String key){
        scheduledFutures.get(key).cancel(true);
    }



}
