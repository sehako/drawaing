package com.aioi.drawaing.drawinggameservice.room.presentation.dto;

import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;

public record CreateRoomRequest(String title, AddRoomParticipantInfo addRoomParticipantInfo) {
}
