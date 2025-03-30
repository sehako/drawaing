package com.aioi.drawaing.drawinggameservice.drawing.presentation;

import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.DrawInfo;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.WinParticipantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DrawingController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final DrawingService drawingService;

    @MessageMapping("/session.draw/{roomId}/{sessionId}")
    public void send(@DestinationVariable String roomId, @DestinationVariable String sessionId, @Payload HashMap<Long, List<DrawInfo>> drawInfo) {
        log.info("send message: {}", drawInfo.toString());
        simpMessagingTemplate.convertAndSend("/topic/session.draw/" + roomId + "/" + sessionId, drawInfo);
    }

    @MessageMapping("/session.end/{roomId}/{sessionId}")
    public void endDraw(@DestinationVariable String roomId, @DestinationVariable String sessionId) {
        drawingService.resetDrawingTimer(sessionId);
    }

    @MessageMapping("/session.lose/{roomId}/{sessionId}")
    public void lose(@DestinationVariable String roomId, @DestinationVariable String sessionId) {
        drawingService.lose(roomId, sessionId);
    }

    @MessageMapping("/session.correct/{roomId}/{sessionId}")
    public void win(@DestinationVariable String roomId, @DestinationVariable String sessionId, @Payload WinParticipantInfo winParticipantInfo) {
        log.info(sessionId);
        drawingService.win(roomId, sessionId, winParticipantInfo);
    }


//    @SendTo
//    @MessageMapping("/send")
//    public void send(@Payload String message) {
//        log.info("send message: {}", message);
//        System.out.println("send message: " + message);
//
//        simpMessagingTemplate.convertAndSend("/topic/1", message);
//    }


}
