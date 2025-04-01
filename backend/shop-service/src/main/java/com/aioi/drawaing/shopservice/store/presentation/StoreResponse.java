package com.aioi.drawaing.shopservice.store.presentation;

import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import com.aioi.drawaing.shopservice.store.domain.Store;
import lombok.Builder;

@Builder
public record StoreResponse(
        Long itemId,
        String name,
        String description,
        ItemCategory category,
        String imageUrl,
        Integer Price,
        Boolean isQuantityLimited,
        Integer remainingQuantity
) {
    public static StoreResponse from(Store store) {
        return StoreResponse.builder()
                .itemId(store.getItem().getItemId())
                .name(store.getItem().getName())
                .description(store.getItem().getDescription())
                .category(store.getItem().getCategory())
                .imageUrl(store.getItem().getImageUrl())
                .Price(store.getPrice())
                .isQuantityLimited(store.getIsQuantityLimited())
                .remainingQuantity(store.getRemainingQuantity())
                .build();
    }
}
