package com.aioi.drawaing.shopservice.inventory.presentation.response;

import com.aioi.drawaing.shopservice.inventory.domain.Inventory;
import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import lombok.Builder;

@Builder
public record InventoryResponse(
        Long inventoryId,
        Long itemId,
        String name,
        String description,
        ItemCategory category,
        String imageUrl,
        Integer quantity
) {
    public static InventoryResponse from(Inventory inventory) {
        return InventoryResponse.builder()
                .inventoryId(inventory.getInventoryId())
                .itemId(inventory.getItem().getItemId())
                .name(inventory.getItem().getName())
                .description(inventory.getItem().getDescription())
                .category(inventory.getItem().getCategory())
                .imageUrl(inventory.getItem().getImageUrl())
                .quantity(inventory.getQuantity())
                .build();
    }
}
