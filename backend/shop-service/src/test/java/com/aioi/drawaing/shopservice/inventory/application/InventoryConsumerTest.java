package com.aioi.drawaing.shopservice.inventory.application;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aioi.drawaing.shopservice.inventory.domain.Inventory;
import com.aioi.drawaing.shopservice.inventory.infrastructure.repository.InventoryRepository;
import com.aioi.drawaing.shopservice.item.domain.Item;
import com.aioi.drawaing.shopservice.item.infrastructure.repository.ItemRepository;
import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import com.aioi.drawaing.shopservice.store.presentation.request.PurchaseRequest;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryConsumerTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private InventoryConsumer inventoryConsumer;

    private final Long testItemId = 1L;
    private final Long testMemberId = 100L;
    private final int testPrice = 20;
    private final int testQuantity = 5;
    private PurchaseRequest testPurchaseRequest = new PurchaseRequest(testMemberId, testItemId, testPrice,
            testQuantity);

    // 성공 케이스 1: 기존 인벤토리 업데이트
    @Test
    void updateInventory_ExistingInventory() {
        // Given
        Item mockItem = mock(Item.class);
        Inventory existingInventory = mock(Inventory.class);

        when(itemRepository.findById(testItemId)).thenReturn(Optional.of(mockItem));
        when(inventoryRepository.findByMemberIdAndItemId(testMemberId, testItemId))
                .thenReturn(Optional.of(existingInventory));

        PurchaseEvent event = PurchaseEvent.of(testPurchaseRequest, LocalDateTime.now());

        // When
        inventoryConsumer.updateInventory(event);

        // Then
        verify(existingInventory).addQuantity(testQuantity);
        verify(inventoryRepository).save(existingInventory);
    }

    // 성공 케이스 2: 새 인벤토리 생성
    @Test
    void updateInventory_NewInventory() {
        // Given
        Item mockItem = mock(Item.class);
        when(itemRepository.findById(testItemId)).thenReturn(Optional.of(mockItem));
        when(inventoryRepository.findByMemberIdAndItemId(testMemberId, testItemId))
                .thenReturn(Optional.empty());

        Inventory savedInventory = mock(Inventory.class);
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(savedInventory);

        PurchaseEvent event = PurchaseEvent.of(testPurchaseRequest, LocalDateTime.now());

        // When
        inventoryConsumer.updateInventory(event);

        // Then
        verify(inventoryRepository).save(argThat(inventory ->
                inventory.getMemberId().equals(testMemberId) &&
                        inventory.getItem().equals(mockItem) &&
                        inventory.getQuantity() == testQuantity
        ));
    }

    // 실패 케이스: 아이템 미존재
    @Test
    void updateInventory_ItemNotFound() {
        // Given
        when(itemRepository.findById(testItemId)).thenReturn(Optional.empty());
        PurchaseEvent event = PurchaseEvent.of(testPurchaseRequest, LocalDateTime.now());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            inventoryConsumer.updateInventory(event);
        });
        verify(inventoryRepository, never()).save(any());
    }
}

