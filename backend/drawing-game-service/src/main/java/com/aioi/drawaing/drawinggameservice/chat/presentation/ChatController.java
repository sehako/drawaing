package com.aioi.drawaing.drawinggameservice.chat.presentation;

import com.aioi.drawaing.drawinggameservice.chat.application.ChatService;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat/{roomId}")
    public void handleChatMessage(@DestinationVariable String roomId, @Payload ChatMessage message) {
        // MongoDB에 메시지 저장
        ChatMessage savedMessage = chatService.saveMessage(ChatMessageDto.of(message));
        log.info("savedMessage = {}", savedMessage.toString());

        // 저장된 메시지를 클라이언트에게 브로드캐스트
        simpMessagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
    }
}
