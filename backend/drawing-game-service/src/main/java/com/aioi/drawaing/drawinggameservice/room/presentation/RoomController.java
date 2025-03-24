package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.room.application.RoomService;
import com.aioi.drawaing.drawinggameservice.room.application.dto.CreateRoomResponse;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.CreateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController("/api/v1/drawing/room")
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public CreateRoomResponse createRoom(CreateRoomRequest createRoomRequest) {
        return roomService.createRoom(new AddRoomParticipantInfo(123, "aaaa","urlrulurl"),  createRoomRequest);
    }
}
