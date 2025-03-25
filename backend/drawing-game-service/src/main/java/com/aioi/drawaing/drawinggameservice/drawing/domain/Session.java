package com.aioi.drawaing.drawinggameservice.drawing.domain;


import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Document(collection = "game_sessions")
public class Session {
    @Id
    private String id;
    private String roomId;
    private List<String> words;
    private int wordIdx;
    private int humanWin;
    private int drawIdx;
    private int roundCount;
    @Builder.Default
    private Map<Long, Participant> participants = new ConcurrentHashMap<>();

    public static Session createSession(String roomId){
        return Session.builder()
                .roomId(roomId)
                .build();
    }

    public void addParticipant(Long userId, Participant participant){
        this.participants.put(userId, participant);
    }

    public List<Long> getParticipants(){
        return new ArrayList<>(this.participants.keySet());
    }

    public void deleteParticipant(int userId, Participant participant){
        this.participants.remove(userId);
    }

    public void updateSessionStartInfo(List<String> words, List<AddRoomParticipantInfo> addParticipantInfos) {
        this.words = words;
        addParticipantInfos.forEach(addParticipantInfo -> {
            addParticipant(addParticipantInfo.userId(), Participant.createParticipant(addParticipantInfo.nickname(), addParticipantInfo.characterUrl()));
        });
    }

    public void incrementRoundCount(){
        this.roundCount++;
    }
}
