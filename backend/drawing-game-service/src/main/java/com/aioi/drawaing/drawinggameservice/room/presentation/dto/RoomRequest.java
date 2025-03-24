package com.aioi.drawaing.drawinggameservice.room.presentation.dto;

import lombok.Builder;

@Builder
public record RoomRequest(
        long memberId,
        String nick,
        String characterUrl
) {
}
