package com.aioi.drawaing.authservice.ranking.presentation.request;

import com.aioi.drawaing.authservice.game.infrastructure.dto.GameResultEvent;
import lombok.Builder;

@Builder
public record GameResultRequest(
        Long memberId,
        String status,
        Integer score
) {
    public static GameResultRequest from(GameResultEvent event) {
        return GameResultRequest.builder()
                .memberId(event.memberId())
                .status(event.status())
                .score(event.score())
                .build();
    }
}