package com.aioi.drawaing.drawinggameservice.chat.presentation.dto;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import lombok.Builder;

@Builder
public record ChatMessageDto(
        Long senderId,
        String message,
        LocalDateTime createdAt
) {
    public static ChatMessageDto of(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .senderId(chatMessage.getSenderId())
                .message(chatMessage.getMessage())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Override
    public String toString() {
        return "ChatMessageDto{" +
                "senderId='" + senderId + '\'' +
                ", message='" + message + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }

}
