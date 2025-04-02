package com.aioi.drawaing.authservice.ranking.presentation.request;

public record GameResultRequest(
        Long memberId,
        String status,
        Integer score
) {
}