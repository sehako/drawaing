package com.aioi.drawaing.drawinggameservice.session.domain;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@Getter
@Document(collection = "socket_session")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class SocketSession {
    @Id
    private String id;
    private String memberId;
    private String socketSessionId;
    private String roomId;
    private String sessionId;

    public static SocketSession create(String memberId, String socketSessionId) {
        return SocketSession.builder().memberId(memberId).socketSessionId(socketSessionId).build();
    }
}
