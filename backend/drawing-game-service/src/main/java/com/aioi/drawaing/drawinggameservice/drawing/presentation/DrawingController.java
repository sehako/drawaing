package com.aioi.drawaing.drawinggameservice.drawing.presentation;

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

    @MessageMapping("/session.draw/{roomId}/{sessionId}")
    public void send(@DestinationVariable String roomId, @DestinationVariable String sessionId, @Payload List<DrawInfo> drawInfo) {
        log.info("send message: {}", drawInfo.toString());
//        System.out.println("send message: " + message + " " + roomId + " " + sessionId);

        simpMessagingTemplate.convertAndSend("/topic/session.draw/"+roomId+"/"+sessionId, drawInfo);
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
