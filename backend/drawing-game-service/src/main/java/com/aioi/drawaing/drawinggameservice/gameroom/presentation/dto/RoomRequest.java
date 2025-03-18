package com.aioi.drawaing.drawinggameservice.gameroom.presentation.dto;

import lombok.Builder;

@Builder
public record RoomRequest(
        String memberId
) {
}
