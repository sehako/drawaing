package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.inventory.infrastructure.repository.InventoryRepository;
import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import com.aioi.drawaing.shopservice.store.domain.Store;
import com.aioi.drawaing.shopservice.store.infrastructure.repository.StoreRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class PurchaseService {
    private final StoreRepository storeRepository;
    private final InventoryRepository inventoryRepository;
    private final KafkaTemplate<String, PurchaseEvent> kafkaTemplate;

    public void processPurchase(Long memberId, Long itemId, int quantity) {
        Store store = storeRepository.findByItem_ItemId(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        validatePurchase(store, quantity);

        store.updateQuantity(quantity);

        // Kafka 이벤트 발행
        kafkaTemplate.send("purchase-events",
                new PurchaseEvent(memberId, itemId, quantity, LocalDateTime.now()));
    }

    private void validatePurchase(Store store, int quantity) {
        if (store.getIsQuantityLimited() && store.getRemainingQuantity() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }
    }
}

