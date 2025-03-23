package com.aioi.drawaing.drawinggameservice.drawing.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.Timer;
import com.aioi.drawaing.drawinggameservice.drawing.domain.TimeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class DrawingService {
    private final DrawMessagePublisher drawMessagePublisher;
    private final Map<String, AtomicInteger> remainTime=new ConcurrentHashMap<>();; //type(session, draw)+sessionId
    private final Map<String, ScheduledFuture<?>> scheduledFutures=new ConcurrentHashMap<>(); //type(session, draw)+sessionId
    private final ScheduledExecutorService schedule;

    //세션 시작


    //게임 제시어 뽑기
    public List<String> extractWords(int count) {
        List<String> words=new ArrayList<>();
        return words;
    }

    //세션 시작할 때, 게임 제시어 주기


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

    public void resetDrawingTimer(String key, int startTime) {
        remainTime.put(key, new AtomicInteger(startTime));
    }

    private String getKey(TimeType timeType, String sessionId) {
        return timeType.name()+":"+sessionId;
    }

    private void stopTimer(String key){
        scheduledFutures.get(key).cancel(true);
    }


}
