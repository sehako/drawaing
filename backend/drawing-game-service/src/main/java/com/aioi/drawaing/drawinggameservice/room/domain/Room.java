package com.aioi.drawaing.drawinggameservice.room.domain;

import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import jakarta.persistence.Id;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    private Long hostId;
    private String title;
    private String code;
    private String sessionId;
    private String status;
    @Builder.Default
    private Map<Long, RoomParticipant> participants = new LinkedHashMap<>();

    public static Room createRoom(AddRoomParticipantInfo addRoomParticipantInfo, String title) {
        Room room = Room.builder()
            .title(title)
            .hostId(addRoomParticipantInfo.memberId())
            .code(RandomCodeGenerator.generateRandomCode(6))
            .status(RoomStatus.READY.name())
            .build();
        room.getParticipants().put(addRoomParticipantInfo.memberId(), RoomParticipant.createRoomParticipant(addRoomParticipantInfo.nickname(), addRoomParticipantInfo.characterUrl()));
        return room;
    }

    public List<AddRoomParticipantInfo> getAddRoomParticipantInfos() {
        return participants.entrySet().stream()
                .map(entry -> new AddRoomParticipantInfo(entry.getKey(), entry.getValue().getNickname(), entry.getValue().getCharacterUrl()))
                .collect(Collectors.toList());
    }

    public void addParticipant(AddRoomParticipantInfo addRoomParticipantInfo) {
//        System.out.println("room: "+addRoomParticipantInfo.memberId());
        this.getParticipants().put(addRoomParticipantInfo.memberId(), RoomParticipant.createRoomParticipant(addRoomParticipantInfo.nickname(), addRoomParticipantInfo.characterUrl()));
    }

    public void updateParticipantReady(long userId) {
        this.getParticipants().get(userId).updateReady();
    }

    public void updateSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    // 방장 갱신 로직 (순차적 선택)
    public void updateHostIfNeeded() {
        if (!participants.containsKey(hostId) && !participants.isEmpty()) {
            // 가장 오래된 참여자 선택 (LinkedHashMap의 첫 번째 키)
            this.hostId = participants.keySet().iterator().next();
            this.status = RoomStatus.READY.name();
        }
    }

    public void updateHostId(long hostId) {
        this.hostId = hostId;
    }

}
