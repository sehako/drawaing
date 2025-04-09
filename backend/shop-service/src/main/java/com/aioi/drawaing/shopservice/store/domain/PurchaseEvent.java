package com.aioi.drawaing.shopservice.store.domain;

import com.aioi.drawaing.shopservice.store.presentation.request.PurchaseRequest;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record PurchaseEvent(
        Long memberId,
        Long itemId,
        int price,
        int quantity,
        LocalDateTime purchaseTime
) {
    public static PurchaseEvent of(PurchaseRequest request, LocalDateTime purchaseTime) {
        return PurchaseEvent.builder()
                .memberId(request.memberId())
                .itemId(request.itemId())
                .price(request.price())
                .quantity(request.quantity())
                .purchaseTime(purchaseTime)
                .build();
    }
}

