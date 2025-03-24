package com.aioi.drawaing.drawinggameservice.drawing.infrastructure;

import com.aioi.drawaing.drawinggameservice.drawing.domain.RoomSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoomSesseionRepository extends MongoRepository<RoomSession, String> {
    Optional<RoomSession> findByRoomId(String roomId);
}
