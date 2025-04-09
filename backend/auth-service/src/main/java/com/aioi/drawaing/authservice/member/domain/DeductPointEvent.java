package com.aioi.drawaing.authservice.member.domain;

import lombok.Builder;

@Builder
public record DeductPointEvent(
        Long memberId,
        int price
) {
    public static DeductPointEvent of(Long memberId, int price) {
        return DeductPointEvent.builder()
                .memberId(memberId)
                .price(price)
                .build();
    }
}
