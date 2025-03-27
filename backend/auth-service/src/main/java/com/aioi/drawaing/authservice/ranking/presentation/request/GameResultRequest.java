package com.aioi.drawaing.authservice.ranking.presentation.request;

import com.aioi.drawaing.authservice.ranking.presentation.RankingController.GameStatus;

public record GameResultRequest(
        GameStatus status,
        Integer score
) {
}
