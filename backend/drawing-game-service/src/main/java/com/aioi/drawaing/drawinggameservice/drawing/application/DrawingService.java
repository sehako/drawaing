package com.aioi.drawaing.drawinggameservice.drawing.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.SessionTimer;
import com.aioi.drawaing.drawinggameservice.drawing.domain.TimeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public void publishSessionTimer(String roomId, String sessionId, int startTime) {
        String key = getKey(TimeType.SESSION, sessionId);
        remainTime.put(key, new AtomicInteger(startTime));

        ScheduledFuture<?> scheduledFuture = schedule.scheduleAtFixedRate(()->{
            int time = remainTime.get(key).decrementAndGet();
            if(remainTime.get(key).intValue()<=0){
                remainTime.remove(key);
                stopTimer(key);
            }
            drawMessagePublisher.publishSessionTimer("/topic/session.total-timer/"+roomId+"/"+sessionId, new SessionTimer(time));

        }, 0,1,TimeUnit.SECONDS);

        scheduledFutures.put(key, scheduledFuture);
    }

    private String getKey(TimeType timeType, String sessionId) {
        return timeType.name()+":"+sessionId;
    }

    private void stopTimer(String key){
        scheduledFutures.get(key).cancel(true);
    }
}
