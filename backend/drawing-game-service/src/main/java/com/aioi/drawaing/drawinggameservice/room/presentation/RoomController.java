package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.room.application.RoomService;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.CreateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController("/api/v1/drawing/room")
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public String createRoom(CreateRoomRequest createRoomRequest) {
        return roomService.createRoom("123",  createRoomRequest);
    }
}
