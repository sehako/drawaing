package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import com.aioi.drawaing.shopservice.store.domain.Store;
import com.aioi.drawaing.shopservice.store.infrastructure.repository.StoreRepository;
import com.aioi.drawaing.shopservice.store.presentation.request.PurchaseRequest;
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
    private final KafkaTemplate<String, PurchaseEvent> kafkaTemplate;

    public void processPurchase(PurchaseRequest request) {
        Store store = storeRepository.findByItem_ItemId(request.itemId())
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        validatePurchase(store, request.quantity(), request.price());

        store.updateQuantity(request.quantity());

        // Kafka 이벤트 발행
        kafkaTemplate.send("purchase-events",
                PurchaseEvent.of(request, LocalDateTime.now()));
    }

    private void validatePurchase(Store store, int quantity, int price) {
        if (store.getIsQuantityLimited() && store.getRemainingQuantity() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }

    }
}

