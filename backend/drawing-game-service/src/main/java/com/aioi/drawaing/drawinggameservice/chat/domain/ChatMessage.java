package com.aioi.drawaing.drawinggameservice.chat.domain;

import java.time.ZonedDateTime;
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
@NoArgsConstructor // ✅ 기본 생성자 필수
@AllArgsConstructor // ✅ 모든 필드 생성자
@Document(collection = "chats")
public class ChatMessage {
    @Id
    private String id;
    private String senderId; // 보내는 사람
    private String roomId; // 방 번호
    private String emoji; // 이모티콘
    private String message; // 채팅 메시지
    @CreatedDate
    private ZonedDateTime createdAt;
}

