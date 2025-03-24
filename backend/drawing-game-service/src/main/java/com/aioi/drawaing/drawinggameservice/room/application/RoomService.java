package com.aioi.drawaing.drawinggameservice.room.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import com.aioi.drawaing.drawinggameservice.room.infrastructure.repository.RoomRepository;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.CreateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final DrawingService drawingService;

    //Transaction 처리 생각
    public String createRoom(String memberId, CreateRoomRequest createRoomRequest) {
//        drawingService.startSession();
        Room room = Room.createRoom(memberId, createRoomRequest.title(), "123123123");
        return roomRepository.save(room).getId();
    }
}
