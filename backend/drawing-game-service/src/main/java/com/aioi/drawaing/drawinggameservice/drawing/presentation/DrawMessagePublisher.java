package com.aioi.drawaing.drawinggameservice.drawing.presentation;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundInfo;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.RoundResult;
import com.aioi.drawaing.drawinggameservice.drawing.application.dto.Timer;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.DrawInfo;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.ParticipantScoreInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DrawMessagePublisher {
    private final SimpMessagingTemplate simpMessagingTemplate;

//    public void publishTimer(String topic, Timer message) {
//        simpMessagingTemplate.convertAndSend(topic, message);
//    }
    public void publishTimer(String topic, Timer message) {
        simpMessagingTemplate.convertAndSend(topic, message);
    }
    public void publishRoundInfo(String topic, RoundInfo roundInfo){simpMessagingTemplate.convertAndSend(topic, roundInfo);}
    public void publishRoundResult(String topic, RoundResult roundResult){simpMessagingTemplate.convertAndSend(topic, roundResult);}
    public void publishGameResult(String topic, Map<Long, ParticipantScoreInfo> result){simpMessagingTemplate.convertAndSend(topic, result);}
    public void publishDraw(String topic, HashMap<Long, List<DrawInfo>> drawInfo){simpMessagingTemplate.convertAndSend(topic, drawInfo);}
}
