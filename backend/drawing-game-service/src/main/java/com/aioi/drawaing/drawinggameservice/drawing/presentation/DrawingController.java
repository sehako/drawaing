package com.aioi.drawaing.drawinggameservice.drawing.presentation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class DrawingController {
    private final SimpMessagingTemplate simpMessagingTemplate;

//    @SendTo
    @MessageMapping("/send")
    public void send(@Payload String message) {
        log.info("send message: {}", message);
        System.out.println("send message: " + message);

        simpMessagingTemplate.convertAndSend("/topic/1", message);
    }

}
