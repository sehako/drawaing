package com.aioi.drawaing.shopservice.store.application;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import com.aioi.drawaing.shopservice.store.domain.Store;
import com.aioi.drawaing.shopservice.store.infrastructure.repository.StoreRepository;
import com.aioi.drawaing.shopservice.store.presentation.request.PurchaseRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private KafkaTemplate<String, PurchaseEvent> kafkaTemplate;

    @InjectMocks
    private PurchaseService purchaseService;


    private final Long testItemId = 1L;
    private final Long testMemberId = 100L;
    private final int testPrice = 20;
    private final int testQuantity = 5;
    private PurchaseRequest testPurchaseRequest = new PurchaseRequest(testMemberId, testItemId, testPrice,
            testQuantity);

    // 성공 케이스: 정상 구매 처리
    @Test
    void processPurchase_Success() {
        // Given
        Store mockStore = mock(Store.class);
        when(mockStore.getIsQuantityLimited()).thenReturn(false); // 수량 제한 없음
        when(storeRepository.findByItem_ItemId(testItemId)).thenReturn(Optional.of(mockStore));

        // When
        purchaseService.processPurchase(testPurchaseRequest);

        // Then
        verify(mockStore).updateQuantity(testQuantity);
        verify(kafkaTemplate).send(eq("purchase-events"), any(PurchaseEvent.class));
    }

    // 실패 케이스 1: 존재하지 않는 상품
    @Test
    void processPurchase_ItemNotFound() {
        // Given
        when(storeRepository.findByItem_ItemId(testItemId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            purchaseService.processPurchase(testPurchaseRequest);
        });
        verify(kafkaTemplate, never()).send(any(), any());
    }

    // 실패 케이스 2: 재고 부족
    @Test
    void processPurchase_InsufficientStock() {
        // Given
        Store mockStore = mock(Store.class);
        when(mockStore.getIsQuantityLimited()).thenReturn(true);
        when(mockStore.getRemainingQuantity()).thenReturn(testQuantity - 1); // 재고 부족
        when(storeRepository.findByItem_ItemId(testItemId)).thenReturn(Optional.of(mockStore));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            purchaseService.processPurchase(testPurchaseRequest);
        });
        verify(kafkaTemplate, never()).send(any(), any());
    }

    // 경계값 테스트: 정확한 재고량으로 구매
    @Test
    void processPurchase_ExactStock() {
        // Given
        int exactStock = 5;
        Store mockStore = mock(Store.class);
        when(mockStore.getIsQuantityLimited()).thenReturn(true);
        when(mockStore.getRemainingQuantity()).thenReturn(exactStock);
        when(storeRepository.findByItem_ItemId(testItemId)).thenReturn(Optional.of(mockStore));

        // When
        purchaseService.processPurchase(testPurchaseRequest);

        // Then
        verify(mockStore).updateQuantity(exactStock);
        verify(kafkaTemplate).send(eq("purchase-events"), any(PurchaseEvent.class));
    }
}

