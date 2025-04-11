package com.aioi.drawaing.drawinggameservice.chat.presentation;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatMessagePublisher {
    private final SimpMessagingTemplate simpMessagingTemplate;

    public void publishChat(String topic, ChatMessageDto message) {
        simpMessagingTemplate.convertAndSend(topic, message);
    }
}
