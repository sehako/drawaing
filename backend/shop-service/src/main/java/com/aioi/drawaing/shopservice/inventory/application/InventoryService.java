package com.aioi.drawaing.shopservice.inventory.application;

import com.aioi.drawaing.shopservice.common.response.PageResponse;
import com.aioi.drawaing.shopservice.inventory.domain.Inventory;
import com.aioi.drawaing.shopservice.inventory.infrastructure.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public PageResponse<Inventory> getInventoryByMemberId(Long memberId, Pageable pageable) {
        return PageResponse.from(inventoryRepository.findByMemberId(memberId, pageable));
    }
}
