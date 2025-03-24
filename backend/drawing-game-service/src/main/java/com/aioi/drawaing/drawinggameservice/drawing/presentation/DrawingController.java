package com.aioi.drawaing.drawinggameservice.drawing.presentation;

import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.AddParticipantInfo;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.DrawInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DrawingController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final DrawingService drawingService;

    @MessageMapping("/session.draw/{roomId}/{sessionId}")
    public void send(@DestinationVariable String roomId, @DestinationVariable String sessionId, @Payload List<DrawInfo> drawInfo) {
        log.info("send message: {}", drawInfo.toString());
//        System.out.println("send message: " + message + " " + roomId + " " + sessionId);

        simpMessagingTemplate.convertAndSend("/topic/session.draw/" + roomId + "/" + sessionId, drawInfo);
    }

    @MessageMapping("/session.start/{roomId}/{sessionId}")
    public void start(@DestinationVariable String roomId, @DestinationVariable String sessionId, @Payload AddParticipantInfo addParticipantInfo) {
        drawingService.startSession(roomId, sessionId, addParticipantInfo);
    }


    // 삭제 예정 : 세션 타이머 보는 용도
    @MessageMapping("/send")
    public void send(@Payload String message) {
        drawingService.publishSessionTimer("1","1",10);
    }

    // 삭제 예정 : 그림 타이머
    @MessageMapping("/draw")
    public void draw(@Payload String message) {
        drawingService.publishDrawingTimer("1","1",2);
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
