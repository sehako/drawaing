package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.common.response.PageResponse;
import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import com.aioi.drawaing.shopservice.store.domain.Store;
import com.aioi.drawaing.shopservice.store.infrastructure.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;

    public PageResponse<Store> getItemsByCategory(String category, Pageable pageable) {
        ItemCategory itemCategory = parseItemCategory(category);
        return PageResponse.from(storeRepository.findByItemCategory(itemCategory, pageable));
    }

    private ItemCategory parseItemCategory(String category) {
        try {
            return ItemCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 아이템 카테고리: " + category);
        }
    }
}
