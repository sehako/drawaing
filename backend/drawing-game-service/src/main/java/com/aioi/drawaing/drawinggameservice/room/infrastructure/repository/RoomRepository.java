package com.aioi.drawaing.drawinggameservice.room.infrastructure.repository;

import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByCode(String code);
}

