package com.aioi.drawaing.drawinggameservice.chat.application;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import com.aioi.drawaing.drawinggameservice.chat.infrastructure.repository.ChatRepository;
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

    private final ChatRepository chatRepository;
    private final MongoTemplate mongoTemplate;

    public ChatMessage saveMessage(ChatMessageDto messageDto) {
        ChatMessage chatMessage = ChatMessage.builder()
                .senderId(messageDto.senderId())
                .roomId(messageDto.roomId())
                .emoji(messageDto.emoji())
                .message(messageDto.message())
                .build();
        return chatRepository.save(chatMessage);
    }
    public ChatMessage findLatestMessageByRoomId(String roomId) {
        return mongoTemplate.findOne(
                Query.query(Criteria.where("roomId").is(roomId))
                        .with(Sort.by(Sort.Direction.DESC, "createdAt")),
                ChatMessage.class
        );
    }

}

