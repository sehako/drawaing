package com.aioi.drawaing.drawinggameservice.drawing.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundInfo;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundResult;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.Timer;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.ParticipantScoreInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class DrawMessagePublisher {
    private final SimpMessagingTemplate simpMessagingTemplate;

    void publishTimer(String topic, Timer message) {
        simpMessagingTemplate.convertAndSend(topic, message);
    }
    void publishRoundInfo(String topic, RoundInfo roundInfo){simpMessagingTemplate.convertAndSend(topic, roundInfo);}
    void publishRoundResult(String topic, RoundResult roundResult){simpMessagingTemplate.convertAndSend(topic, roundResult);}
    void publishGameResult(String topic, Map<Long, ParticipantScoreInfo> result){simpMessagingTemplate.convertAndSend(topic, result);}
}
