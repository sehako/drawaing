package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.common.code.SuccessStatus;
import com.aioi.drawaing.drawinggameservice.common.response.ApiResponse;
import com.aioi.drawaing.drawinggameservice.room.application.RoomService;
import com.aioi.drawaing.drawinggameservice.room.application.dto.RoomInfo;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.CreateRoomRequest;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.RoomId;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/api/v1/drawing/room")
@RestController
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public ApiResponse<RoomInfo> createRoom(@RequestBody CreateRoomRequest createRoomRequest) {
        return ApiResponse.onSuccess(SuccessStatus.CREATED_ROOM, roomService.createRoom(createRoomRequest));
    }

    @GetMapping
    public ApiResponse<RoomId> findRoomByCode(@RequestParam("code") String code) {
        return ApiResponse.onSuccess(SuccessStatus.ROOM_CODE_FOUND, roomService.findRoomByCode(code));
    }

}
