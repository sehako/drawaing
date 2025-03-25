package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.room.application.RoomSocketService;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
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
public class RoomSocketController {

    private final RoomSocketService roomSocketService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/room.ready/{roomId}")
    public void handleReady(@DestinationVariable String roomId,
                            @Payload RoomRequest request) {
        roomSocketService.toggleReadyStatus(roomId, request.memberId());
    }
//    @MessageMapping("/room.create/{roomId}")
//    public void createRoom(@DestinationVariable String roomId,
//                           @Payload RoomRequest request) {
//        roomSocketService.createRoom(roomId, request.memberId());
//    }
    @MessageMapping("/room.join/{roomId}")
    public void joinRoom(@DestinationVariable String roomId,
                           @Payload AddRoomParticipantInfo addRoomParticipantInfo) {
        System.out.println("join: "+roomId);
        roomSocketService.joinRoom(roomId, addRoomParticipantInfo);
    }
    @MessageMapping("/room.start/{roomId}")
    public void startGame(@DestinationVariable String roomId,
                           @Payload RoomRequest request) {
        System.out.println("start: "+request.memberId());
        roomSocketService.startGame(roomId, request.memberId());
    }
    @MessageMapping("/room.leave/{roomId}")
    public void leaveRoom(@DestinationVariable String roomId,
                         @Payload RoomRequest request) {
        roomSocketService.leaveRoom(roomId, request.memberId());
    }
    // 필요한가?
    @MessageExceptionHandler
    public void handleException(Exception e, SimpMessageHeaderAccessor headerAccessor) {
        messagingTemplate.convertAndSendToUser(
                Objects.requireNonNull(headerAccessor.getSessionId()),
                "/queue/errors",
                Map.of("error", e.getMessage())
        );
    }

}
