package com.aioi.drawaing.drawinggameservice.room.application;

import com.aioi.drawaing.drawinggameservice.common.response.ApiResponse;
import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import com.aioi.drawaing.drawinggameservice.room.application.dto.RoomInfo;
import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import com.aioi.drawaing.drawinggameservice.room.infrastructure.repository.RoomRepository;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.CreateRoomRequest;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.RoomId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final DrawingService drawingService;

    //Transaction 처리 생각
    public RoomInfo createRoom(CreateRoomRequest createRoomRequest) {
        Room room = Room.createRoom(createRoomRequest.addRoomParticipantInfo(), createRoomRequest.title());
        room.updateParticipantReady(createRoomRequest.addRoomParticipantInfo().memberId());
        roomRepository.save(room);

        Session session = drawingService.createSession(room.getId());

        room.updateSessionId(session.getId());
        return new RoomInfo(roomRepository.save( room).getId(), room.getCode());
    }

    public RoomId findRoomByCode(String code) {
        Room room =roomRepository.findByCode(code).orElseThrow(()->{
            log.error("code에 해당하는 room이 없습니다.");
            return new RuntimeException("room이 없습니다.");
        });
        return new RoomId(room.getId(), room.getParticipantSize(), room.getTitle());
    }

}
