package com.aioi.drawaing.shopservice.inventory.application;

import com.aioi.drawaing.shopservice.inventory.domain.Inventory;
import com.aioi.drawaing.shopservice.inventory.infrastructure.repository.InventoryRepository;
import com.aioi.drawaing.shopservice.item.domain.Item;
import com.aioi.drawaing.shopservice.item.infrastructure.repository.ItemRepository;
import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryConsumer {
    private final InventoryRepository inventoryRepository;
    private final ItemRepository itemRepository;

    @KafkaListener(
            topics = "purchase-events",
            containerFactory = "purchaseEventListenerContainerFactory",
            groupId = "inventory-group"
    )
    public void updateInventory(PurchaseEvent event) {
        Item item = itemRepository.findById(event.itemId())
                .orElseThrow(() -> new EntityNotFoundException("Item not found for ID: " + event.itemId()));

        // Inventory 조회 또는 생성
        Inventory inventory = inventoryRepository.findByMemberIdAndItemId(event.memberId(), event.itemId())
                .orElseGet(() -> Inventory.builder()
                        .memberId(event.memberId())
                        .item(item)
                        .build());
        // 수량 업데이트
        inventory.addQuantity(event.quantity());

        // 저장
        inventoryRepository.save(inventory);
    }
}

