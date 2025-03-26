package com.aioi.drawaing.drawinggameservice.room.application.dto;

import com.aioi.drawaing.drawinggameservice.room.domain.RoomParticipant;

public record AddRoomParticipantInfo(long memberId, String nickname, String characterUrl) {
    public static AddRoomParticipantInfo create(long memberId, RoomParticipant roomParticipant) {
        return new AddRoomParticipantInfo(memberId, roomParticipant.getNickname(), roomParticipant.getCharacterUrl());
    }
}
