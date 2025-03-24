package com.aioi.drawaing.drawinggameservice.chat.presentation.dto;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import java.time.ZonedDateTime;
import lombok.Builder;

@Builder
public record ChatMessageDto(
        String senderId,
        String roomId,
        String message,
        ZonedDateTime createdAt
) {
    public static ChatMessageDto of(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .senderId(chatMessage.getSenderId())
                .roomId(chatMessage.getRoomId())
                .message(chatMessage.getMessage())
                .createdAt(ZonedDateTime.now())
                .build();
    }
}
