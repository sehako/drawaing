package com.aioi.drawaing.drawinggameservice.drawing.domain;


import com.aioi.drawaing.drawinggameservice.drawing.application.dto.GameResultEvent;
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
            addParticipant(addParticipantInfo.memberId(), Participant.createParticipant(addParticipantInfo.nickname(), addParticipantInfo.characterUrl()));
        });
    }

    public void incrementRoundCount(){
        this.roundCount++;
    }

    public int getChanceCount(Long userId){
        return this.participants.get(userId).getChanceCount();
    }

    public void decrementParticipantChanceCount(Long userId){
        this.participants.get(userId).decrementChanceCount();
    }

    public List<GameResultEvent> getGameResults(){
        return participants.entrySet().stream()
                .map(entry -> {
                    Long memberId = entry.getKey();
                    Participant participant = entry.getValue();
                    int score = calculateScore(participant);
                    return new GameResultEvent(memberId, getStatus(), score, calculateExp(), getPoint(score));
                })
                .toList();
    }

    public Map<Long, ParticipantScoreInfo> toParticipantScoreInfo(){
        return participants.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, // 기존 Long 키 유지
                        entry -> {
                            int score = calculateScore(entry.getValue());
                            return new ParticipantScoreInfo(this.humanWin, score, getPoint(score), calculateExp()); // 값 변환
                        }
                ));
    }

    private int getPoint(int score){ return Math.max(10, score); }

    private int calculateExp(){
        return 10+(getStatus().equals("WIN")?10:0)+this.humanWin;
    }

    private String getStatus(){
        int loseCnt=this.roundCount-this.humanWin;

        if(this.humanWin==loseCnt) return "DRAW";
        else if(this.humanWin>loseCnt) return "WIN";
        return "LOSE";
    }

    private int calculateScore(Participant participant){
        return this.humanWin*2-(this.roundCount-this.humanWin)*2+participant.getBonusPointsDrawing()+participant.getBonusPointsGuessing();
    }

    public void win(WinParticipantInfo winParticipantInfo, int correctScore, int drawScore){
        this.humanWin++;
        incrementRoundCount();
        this.participants.get(winParticipantInfo.drawingMemberId()).incrementBonusPointsDrawing(drawScore);
        this.participants.get(winParticipantInfo.answerMemberId()).incrementBonusPointsGuessing(correctScore);
    }
}
