package com.aioi.drawaing.drawinggameservice.chat.presentation.dto;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChatMessageDto(
        String memberId,  // 보내는 사람 ID
        String roomId,    // 방 번호
        String emoji,     // 이모티콘
        String message,   // 채팅 내용
        LocalDateTime createdAt // 생성 시간
) {
    public static ChatMessageDto of(ChatMessage chatMessage) {
        return ChatMessageDto.builder()
                .memberId(chatMessage.getMemberId())
                .roomId(chatMessage.getRoomId())
                .emoji(chatMessage.getEmoji())
                .message(chatMessage.getMessage())
                .createdAt(LocalDateTime.now())
                .build();
    }
}
