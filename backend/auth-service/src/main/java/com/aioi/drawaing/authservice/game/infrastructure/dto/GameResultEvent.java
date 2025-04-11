package com.aioi.drawaing.authservice.game.infrastructure.dto;

public record GameResultEvent(
        Long memberId,
        String status, //WIN, LOSE, DRAW
        Integer score,
        Integer exp,
        Integer point
) {
}
