package com.aioi.drawaing.drawinggameservice.room.domain;

import lombok.*;

@Builder
@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomParticipant {
    private String nickname;
    private String characterUrl;
    private boolean isReady;

    public static RoomParticipant createRoomParticipant(String nickname, String characterUrl) {
        return RoomParticipant.builder()
                .nickname(nickname)
                .characterUrl(characterUrl)
                .build();
    }

    public void updateReady(){
        this.isReady = !this.isReady;
    }
}
