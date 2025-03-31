package com.aioi.drawaing.drawinggameservice.drawing.domain;

import lombok.*;

@Builder
@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Participant {
    private String nickname;
    private String characterUrl;
    private int bonusPointsGuessing;  // 맞춘 추가 점수
    private int bonusPointsDrawing; // 그림 추가 점수
    private int chanceCount; // 기회 횟수

    public static Participant createParticipant(String nickname, String characterUrl){
        return Participant.builder()
                .nickname(nickname)
                .characterUrl(characterUrl)
                .chanceCount(3)
                .build();
    }

    public void decrementChanceCount(){
        this.chanceCount--;
    }

    public void incrementBonusPointsGuessing(int bonusPointsGuessing){
        this.bonusPointsGuessing += bonusPointsGuessing;
    }

    public void incrementBonusPointsDrawing(int bonusPointsDrawing){
        this.bonusPointsDrawing += bonusPointsDrawing;
    }
}
