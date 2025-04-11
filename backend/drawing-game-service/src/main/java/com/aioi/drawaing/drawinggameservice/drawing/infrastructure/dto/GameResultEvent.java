package com.aioi.drawaing.drawinggameservice.drawing.infrastructure.dto;

public record GameResultEvent(
        Long memberId,
        String status, //WIN, LOSE, DRAW
        Integer score,
        Integer exp,
        Integer point
) {
}
