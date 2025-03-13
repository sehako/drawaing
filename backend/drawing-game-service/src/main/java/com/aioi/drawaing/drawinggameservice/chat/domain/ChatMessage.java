package com.aioi.drawaing.drawinggameservice.chat.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@ToString
@Document(collection = "chats")
public class ChatMessage {
    @Id
    private String id;
    private String memberId; // 보내는 사람
    private String roomId; // 방 번호
    private String emoji; // 이모티콘
    private String message; // 채팅 메시지
}

