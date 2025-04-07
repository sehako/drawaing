package com.aioi.drawaing.drawinggameservice.room.presentation;

import com.aioi.drawaing.drawinggameservice.room.application.dto.RoomStartInfo;
import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import com.aioi.drawaing.drawinggameservice.room.presentation.dto.RoomInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomMessagePublisher {
    private final SimpMessagingTemplate simpMessagingTemplate;

    public void publishRoomState(Room room) {
        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + room.getId(),
                new RoomInfoResponse(room.getSessionId(), room.getHostId(), room.getParticipants())
        );
    }

    public void publishRoomStart(String topic, RoomStartInfo roomStartInfo) {
        simpMessagingTemplate.convertAndSend(topic, roomStartInfo);
    }

    public void publishTemp(String topic, String message){
        log.info("{}:{}", topic, message);
        simpMessagingTemplate.convertAndSend(topic, message);
    }
}
