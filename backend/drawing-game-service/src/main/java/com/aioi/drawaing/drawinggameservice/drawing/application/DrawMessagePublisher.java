package com.aioi.drawaing.drawinggameservice.drawing.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.SessionTimer;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DrawMessagePublisher {
    private final SimpMessagingTemplate simpMessagingTemplate;

    void publishSessionTimer(String topic, SessionTimer message) {
        simpMessagingTemplate.convertAndSend(topic, message);
    }
}
