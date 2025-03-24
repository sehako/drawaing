package com.aioi.drawaing.drawinggameservice.chat.domain;

import java.time.ZonedDateTime;
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
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Document(collection = "emojis")
public class ChatEmoji {
    @Id
    private String id;
    private String senderId; // 보내는 사람
    private String roomId; // 방 번호
    private String emoji; // 감정표현
    @CreatedDate
    private ZonedDateTime createdAt;
}