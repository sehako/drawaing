package com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.request;

public record GameResultRequest(
        Long memberId,
        String status, //WIN, LOSE, DRAW
        Integer score
) {
}