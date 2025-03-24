package com.aioi.drawaing.drawinggameservice.chat.presentation;

import com.aioi.drawaing.drawinggameservice.chat.application.ChatService;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatEmoji;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatEmojiDto;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
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

    @MessageMapping("/chat.message/{roomId}")
    public void handleChatMessage(@DestinationVariable String roomId, @Payload ChatMessage message) {
        ChatMessage savedMessage = chatService.saveMessage(ChatMessageDto.of(message));
        log.info("savedMessage = {}", savedMessage.toString());
        simpMessagingTemplate.convertAndSend("/topic/chat.message/" + roomId, savedMessage);
    }
    @MessageMapping("/chat.emoji/{roomId}")
    public void handleChatEmoji(@DestinationVariable String roomId, @Payload ChatEmoji message) {
        ChatEmoji savedEmoji = chatService.saveEmoji(ChatEmojiDto.of(message));
        log.info("savedEmoji = {}", savedEmoji.toString());
        simpMessagingTemplate.convertAndSend("/topic/chat.emoji/" + roomId, savedEmoji);
    }
}
