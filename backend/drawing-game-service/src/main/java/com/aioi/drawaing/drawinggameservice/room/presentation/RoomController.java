package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.room.application.RoomService;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.RoomRequest;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/room.ready/{roomId}")
    public void handleReady(@DestinationVariable String roomId,
                            @Payload RoomRequest request) {
        roomService.toggleReadyStatus(roomId, request.memberId());
    }
    @MessageMapping("/room.create{roomId}")
    public void createRoom(@DestinationVariable String roomId,
                           @Payload RoomRequest request) {
        roomService.createRoom(roomId, request.memberId());
    }
    @MessageMapping("/room.join/{roomId}")
    public void joinRoom(@DestinationVariable String roomId,
                           @Payload RoomRequest request) {
        roomService.joinRoom(roomId, request.memberId());
    }
    @MessageMapping("/room.start/{roomId}")
    public void startGame(@DestinationVariable String roomId,
                           @Payload RoomRequest request) {
        roomService.startGame(roomId, request.memberId());
    }
    @MessageMapping("/room.leave/{roomId}")
    public void leaveRoom(@DestinationVariable String roomId,
                         @Payload RoomRequest request) {
        roomService.leaveRoom(roomId, request.memberId());
    }
    // 프론트에 브로드캐스트로 예외 던져주는 코드
    @MessageExceptionHandler
    public void handleException(Exception e, SimpMessageHeaderAccessor headerAccessor) {
        messagingTemplate.convertAndSendToUser(
                Objects.requireNonNull(headerAccessor.getSessionId()),
                "/queue/errors",
                Map.of("error", e.getMessage())
        );
    }

}
