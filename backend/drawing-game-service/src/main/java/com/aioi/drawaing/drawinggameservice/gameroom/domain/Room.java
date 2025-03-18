package com.aioi.drawaing.drawinggameservice.gameroom.domain;

import jakarta.persistence.Id;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Builder
@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    private String hostId;
    private String title;
    private Boolean playing;
    @Builder.Default
    private Map<String, Boolean> participants = new LinkedHashMap<>();

    // 방장 갱신 로직 (순차적 선택)
    public void updateHostIfNeeded() {
        if (!participants.containsKey(hostId) && !participants.isEmpty()) {
            // 가장 오래된 참여자 선택 (LinkedHashMap의 첫 번째 키)
            this.hostId = participants.keySet().iterator().next();
        }
    }

    public void updateHostId(String hostId) {
        this.hostId = hostId;
    }

}
