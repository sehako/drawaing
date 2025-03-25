package com.aioi.drawaing.drawinggameservice.room.presentation.dto;

import com.aioi.drawaing.drawinggameservice.room.domain.RoomParticipant;

import java.util.Map;

public record RoomInfoResponse(String sessionId, Map<Long, RoomParticipant> participants) {
}
