package com.aioi.drawaing.drawinggameservice.gameroom.infrastructure.repository;

import com.aioi.drawaing.drawinggameservice.gameroom.domain.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {
}

