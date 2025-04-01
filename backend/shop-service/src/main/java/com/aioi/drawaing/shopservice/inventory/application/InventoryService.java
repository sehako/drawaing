package com.aioi.drawaing.shopservice.inventory.application;

import com.aioi.drawaing.shopservice.inventory.domain.Inventory;
import com.aioi.drawaing.shopservice.inventory.infrastructure.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public Page<Inventory> getInventoriesByMember(Long memberId, Pageable pageable) {
        return inventoryRepository.findByMemberId(memberId, pageable);
    }
}
