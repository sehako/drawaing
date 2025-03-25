package com.aioi.drawaing.drawinggameservice.drawing.domain;


import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.ParticipantScoreInfo;
import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.WinParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

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

    public Map<Long, ParticipantScoreInfo> toParticipantScoreInfo(){
        return participants.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, // 기존 Long 키 유지
                        entry -> new ParticipantScoreInfo(this.humanWin, this.humanWin*100+entry.getValue().getBonusPointsDrawing()+entry.getValue().getBonusPointsGuessing()) // 값 변환
                ));
    }

    public void win(WinParticipantInfo winParticipantInfo, int correctScore, int drawScore){
        this.humanWin++;
        incrementRoundCount();
        this.participants.get(winParticipantInfo.drawingMemberId()).incrementBonusPointsDrawing(drawScore);
        this.participants.get(winParticipantInfo.answerMemberId()).incrementBonusPointsGuessing(correctScore);
    }
}
