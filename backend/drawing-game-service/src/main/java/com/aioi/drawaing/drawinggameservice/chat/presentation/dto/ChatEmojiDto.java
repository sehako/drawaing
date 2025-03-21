package com.aioi.drawaing.drawinggameservice.chat.presentation.dto;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatEmoji;
import java.time.ZonedDateTime;
import lombok.Builder;

@Builder
public record ChatEmojiDto(
        String senderId,
        String roomId,
        String emoji,
        ZonedDateTime createdAt
) {
    public static ChatEmojiDto of(ChatEmoji chatemoji) {
        return ChatEmojiDto.builder()
                .senderId(chatemoji.getSenderId())
                .roomId(chatemoji.getRoomId())
                .emoji(chatemoji.getEmoji())
                .createdAt(ZonedDateTime.now())
                .build();
    }
}
