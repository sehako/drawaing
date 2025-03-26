package com.aioi.drawaing.drawinggameservice.room.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import com.aioi.drawaing.drawinggameservice.room.application.dto.CreateRoomResponse;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.application.dto.RoomInfo;
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
    public CreateRoomResponse createRoom(CreateRoomRequest createRoomRequest) {
        Room room = Room.createRoom(createRoomRequest.addRoomParticipantInfo(), createRoomRequest.title());
        room.updateParticipantReady(createRoomRequest.addRoomParticipantInfo().memberId());
        roomRepository.save(room);

        Session session = drawingService.createSession(room.getId());

        room.updateSessionId(session.getId());
        return new CreateRoomResponse("CREATE_ROOM", new RoomInfo(roomRepository.save(room).getId(), room.getCode()));
    }
}
