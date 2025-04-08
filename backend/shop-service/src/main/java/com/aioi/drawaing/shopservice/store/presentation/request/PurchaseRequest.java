package com.aioi.drawaing.shopservice.store.presentation.request;


import lombok.Builder;

@Builder
public record PurchaseRequest(
        Long memberId,
        Long itemId,
        Integer price,
        Integer quantity
) {
}
