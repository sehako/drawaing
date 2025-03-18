package com.aioi.drawaing.drawinggameservice.chat.application;

import com.aioi.drawaing.drawinggameservice.chat.presentation.dto.ChatMessageDto;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import com.aioi.drawaing.drawinggameservice.chat.infrastructure.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    public ChatMessage saveMessage(ChatMessageDto messageDto) {
        ChatMessage chatMessage = ChatMessage.builder()
                .memberId(messageDto.memberId())
                .roomId(messageDto.roomId())
                .emoji(messageDto.emoji())
                .message(messageDto.message())
                .build();
        return chatRepository.save(chatMessage);
    }
}

