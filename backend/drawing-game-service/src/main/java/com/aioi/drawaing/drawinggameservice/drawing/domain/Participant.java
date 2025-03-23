package com.aioi.drawaing.drawinggameservice.drawing.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class Participant {
    private int bonusPointsGuessing;  // 맞춘 추가 점수
    private int bonusPointsDrawing; // 그림 추가 점수
    private int chanceCount; // 기회 횟수
}
