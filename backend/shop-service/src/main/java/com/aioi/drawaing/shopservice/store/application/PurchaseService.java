package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.store.domain.DeductPointEvent;
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
@RequiredArgsConstructor
public class PurchaseService {
    private final StoreRepository storeRepository;
    private final KafkaTemplate<String, PurchaseEvent> kafkaTemplatePurchaseEvent;
    private final KafkaTemplate<String, DeductPointEvent> kafkaTemplateDeductPointEvent;

    @Transactional
    public void processPurchase(PurchaseRequest request) {
        Store store = storeRepository.findByItem_ItemId(request.itemId())
                .orElseThrow(() -> new EntityNotFoundException("Item not found"));

        // 1. 재고 확인
        validatePurchase(store, request.quantity());

        // 2. 재고 차감
        store.updateQuantity(request.quantity());
        storeRepository.save(store);

        // 3. Kafka 인벤토리 추가 요청 이벤트 발행
        kafkaTemplatePurchaseEvent.send("purchase-events",
                PurchaseEvent.of(request, LocalDateTime.now()));

        // 4. Kafka 포인트 차감 요청 이벤트 발행
        kafkaTemplateDeductPointEvent.send("deduct-points",
                DeductPointEvent.of(request.memberId(), request.price()));
    }

    private void validatePurchase(Store store, int quantity) {
        if (store.getIsQuantityLimited() && store.getRemainingQuantity() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }
    }
}

