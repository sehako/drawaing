package com.aioi.drawaing.drawinggameservice.room.infrastructure.repository;

import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {
}

