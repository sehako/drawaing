package com.aioi.drawaing.drawinggameservice.chat.infrastructure.repository;

import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatRepository extends MongoRepository<ChatMessage, String> {
}
