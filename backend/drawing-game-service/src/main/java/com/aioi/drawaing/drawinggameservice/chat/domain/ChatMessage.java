package com.aioi.drawaing.drawinggameservice.chat.domain;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 엔티티로 쓰기 위해 필요
@AllArgsConstructor // @Builder, @NoArgsConstructor 같이 쓰려면 필요
@Document(collection = "chats")
public class ChatMessage {
    @Id
    private String id;
    private String senderId; // 보내는 사람
    private String roomId; // 방 번호
    private String message; // 채팅 메시지
    @CreatedDate
    private LocalDateTime createdAt;

    public static ChatMessage createMessage(ChatMessageDto messageDto) {
        return ChatMessage.builder()
                .senderId(messageDto.senderId())
                .roomId(messageDto.roomId())
                .message(messageDto.message())
                .build();
    }
}

