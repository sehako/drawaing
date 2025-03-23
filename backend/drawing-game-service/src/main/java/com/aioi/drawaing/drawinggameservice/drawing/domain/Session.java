package com.aioi.drawaing.drawinggameservice.drawing.domain;


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
    private Map<Integer, Participant> participants = new ConcurrentHashMap<>();

    public static Session createSession(String roomId, List<String> keywords){
        return Session.builder()
                .roomId(roomId)
                .words(keywords)
                .build();
    }

    public void addParticipant(int userId, Participant participant){
        this.participants.put(userId, participant);
    }

    public List<Integer> getParticipants(){
        return new ArrayList<>(this.participants.keySet());
    }

    public void deleteParticipant(int userId, Participant participant){
        this.participants.remove(userId);
    }

}
