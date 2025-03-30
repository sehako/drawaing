package com.aioi.drawaing.authservice.ranking.presentation.request;

import com.aioi.drawaing.authservice.ranking.presentation.RankingController.GameStatus;

public record GameResultRequest(
        Long memberId,
        GameStatus status,
        Integer score
) {
}
