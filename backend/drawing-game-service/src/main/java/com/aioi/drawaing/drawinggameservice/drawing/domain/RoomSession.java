package com.aioi.drawaing.drawinggameservice.drawing.domain;

import lombok.*;
import org.springframework.boot.convert.DurationFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@Getter
@Document(collection = "room_session")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomSession {
    @Id
    private String id;
    private String roomId;
    private String sessionId;

    public static RoomSession buildRoomSession(String roomId, String sessionId) {
        return RoomSession.builder()
                .roomId(roomId)
                .sessionId(sessionId)
                .build();
    }
}
