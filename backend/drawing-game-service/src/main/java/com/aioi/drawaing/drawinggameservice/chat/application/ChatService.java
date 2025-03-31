package com.aioi.drawaing.drawinggameservice.chat.application;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatEmoji;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import com.aioi.drawaing.drawinggameservice.chat.presentation.ChatMessagePublisher;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatEmojiDto;
import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final MongoTemplate mongoTemplate;
    private final ChatMessagePublisher chatMessagePublisher;
    private final DrawingService drawingService;

    public void publishChat(String roomId, String sessionId, ChatMessageDto messageDto){
        log.info("{}: {}", sessionId, messageDto.toString());

        if(decrementParticipantChanceCount(sessionId, messageDto)){
            ChatMessage chatMessage = ChatMessage.createMessage(sessionId, messageDto);
            log.info("{}: {}", sessionId, chatMessage);
            mongoTemplate.save(chatMessage);
            chatMessagePublisher.publishChat("/topic/chat.message/" + roomId +"/"+sessionId, messageDto);
        }
        else{
            log.error("채팅 횟수 기회가 없습니다.");
        }
    }

    private boolean decrementParticipantChanceCount(String sessionId, ChatMessageDto messageDto) {
        Session session = drawingService.findSession(sessionId);

        log.info("decrementParticipantChanceCount: {}: {}", sessionId, session.getChanceCount(Long.valueOf(messageDto.senderId())));

        if(session.getChanceCount(Long.valueOf(messageDto.senderId()))>0){
            session.decrementParticipantChanceCount(Long.valueOf(messageDto.senderId()));
            mongoTemplate.save(session);
            return true;
        }
        return false;
    }


//    public ChatMessage saveMessage(ChatMessageDto messageDto) {
//        ChatMessage chatMessage = ChatMessage.builder()
//                .senderId(messageDto.senderId())
//                .roomId(messageDto.roomId())
//                .message(messageDto.message())
//                .build();
//        return mongoTemplate.save(chatMessage);
//    }

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

