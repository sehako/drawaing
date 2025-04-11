package com.aioi.drawaing.drawinggameservice.drawing.infrastructure;

import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SessionRepository extends MongoRepository<Session, String> {
}
