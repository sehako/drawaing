package com.aioi.drawaing.shopservice.store.domain;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record PurchaseEvent(
        Long memberId,
        Long itemId,
        int quantity,
        LocalDateTime purchaseTime
) {
}

