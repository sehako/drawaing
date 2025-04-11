package com.aioi.drawaing.authservice.member.presentation.request;

import com.aioi.drawaing.authservice.game.infrastructure.dto.GameResultEvent;
import lombok.Builder;

@Builder
public record MemberExpUpdateRequest(
        Long memberId,
        Integer exp,
        Integer point
) {
    public static MemberExpUpdateRequest from(GameResultEvent event) {
        return MemberExpUpdateRequest.builder()
                .memberId(event.memberId())
                .exp(event.exp())
                .point(event.point())
                .build();
    }
}
