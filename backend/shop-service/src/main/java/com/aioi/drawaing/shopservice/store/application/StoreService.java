package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import com.aioi.drawaing.shopservice.store.infrastructure.repository.StoreRepository;
import com.aioi.drawaing.shopservice.store.presentation.StoreResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;

    public Page<StoreResponse> getItemsByCategory(ItemCategory category, Pageable pageable) {
        return storeRepository.findByItemCategory(category, pageable)
                .map(StoreResponse::from);
    }

}
