package com.aioi.drawaing.drawinggameservice.chat.presentation.dto;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import java.time.ZonedDateTime;
import lombok.Builder;

@Builder
public record ChatMessageDto(
        String senderId,  // 보내는 사람 ID
        String roomId,    // 방 번호
        String emoji,     // 이모티콘
        String message,   // 채팅 내용
        ZonedDateTime createdAt // 생성 시간
) {
    public static ChatMessageDto of(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .senderId(chatMessage.getSenderId())
                .roomId(chatMessage.getRoomId())
                .emoji(chatMessage.getEmoji())
                .message(chatMessage.getMessage())
                .createdAt(ZonedDateTime.now())
                .build();
    }
}
