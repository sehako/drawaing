package com.aioi.drawaing.drawinggameservice.chat.application;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatEmoji;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatEmojiDto;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MongoTemplate mongoTemplate;

    public ChatMessage saveMessage(ChatMessageDto messageDto) {
        ChatMessage chatMessage = ChatMessage.builder()
                .senderId(messageDto.senderId())
                .roomId(messageDto.roomId())
                .message(messageDto.message())
                .build();
        return mongoTemplate.save(chatMessage);
    }
    public ChatEmoji saveEmoji(ChatEmojiDto emojiDto) {
        ChatEmoji chatEmoji = ChatEmoji.builder()
                .senderId(emojiDto.senderId())
                .roomId(emojiDto.roomId())
                .emoji(emojiDto.emoji())
                .build();
        return mongoTemplate.save(chatEmoji);
    }
    public ChatMessage findLatestMessageByRoomId(String roomId) {
        return mongoTemplate.findOne(
                Query.query(Criteria.where("roomId").is(roomId))
                        .with(Sort.by(Sort.Direction.DESC, "createdAt")),
                ChatMessage.class
        );
    }
    public ChatEmoji findLatestEmojiByRoomId(String roomId) {
        return mongoTemplate.findOne(
                Query.query(Criteria.where("roomId").is(roomId))
                        .with(Sort.by(Sort.Direction.DESC, "createdAt")),
                ChatEmoji.class
        );
    }

}

