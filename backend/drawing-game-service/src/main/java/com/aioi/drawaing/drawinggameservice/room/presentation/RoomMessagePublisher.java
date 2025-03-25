package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.RoomInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomMessagePublisher {
    private final SimpMessagingTemplate simpMessagingTemplate;

    public void publishRoomState(Room room) {
        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + room.getId(),
                new RoomInfoResponse(room.getSessionId(), room.getParticipants())
        );
    }
}
