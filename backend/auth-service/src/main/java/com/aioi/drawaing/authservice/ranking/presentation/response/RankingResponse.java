package com.aioi.drawaing.authservice.ranking.presentation.response;

import java.time.LocalDateTime;

public interface RankingResponse {
    Long getMemberId();

    String getCharacterImage();

    String getNickname();

    Integer getValue();

    LocalDateTime getLastPlayedAt();
}
