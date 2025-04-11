package com.aioi.drawaing.drawinggameservice.session.infrastructure;

import com.aioi.drawaing.drawinggameservice.session.domain.SocketSession;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SocketSessionRepository extends MongoRepository<SocketSession, String> {
}
