package com.aioi.drawaing.authservice.ranking.presentation.response;

import java.time.LocalDateTime;

public interface RankingResponse {
    Long getMemberId();

    String getNickname();

    Integer getValue();

    LocalDateTime getLastPlayedAt();
}
