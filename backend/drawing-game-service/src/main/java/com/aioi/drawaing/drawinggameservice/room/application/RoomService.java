package com.aioi.drawaing.drawinggameservice.room.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import com.aioi.drawaing.drawinggameservice.room.application.dto.CreateRoomResponse;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
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
    public CreateRoomResponse createRoom(AddRoomParticipantInfo addRoomParticipantInfo, CreateRoomRequest createRoomRequest) {
        Room room = Room.createRoom(addRoomParticipantInfo, createRoomRequest.title());
        roomRepository.save(room);

        Session session = drawingService.createSession(room.getId(), addRoomParticipantInfo);

        room.updateSessionId(session.getId());
        return new CreateRoomResponse("CREATE_ROOM", roomRepository.save(room).getId());
    }
}
