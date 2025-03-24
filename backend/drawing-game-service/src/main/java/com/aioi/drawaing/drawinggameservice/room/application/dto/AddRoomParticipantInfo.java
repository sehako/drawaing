package com.aioi.drawaing.drawinggameservice.room.application.dto;

import com.aioi.drawaing.drawinggameservice.room.domain.RoomParticipant;

public record AddRoomParticipantInfo(long userId, String nickname, String characterUrl) {
    public static AddRoomParticipantInfo create(long userId, RoomParticipant roomParticipant) {
        return new AddRoomParticipantInfo(userId, roomParticipant.getNickname(), roomParticipant.getCharacterUrl());
    }
}
