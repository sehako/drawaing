package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import com.aioi.drawaing.shopservice.store.domain.Store;
import com.aioi.drawaing.shopservice.store.infrastructure.repository.StoreRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;

    public List<Store> getAllItems() {
        return storeRepository.findAll();
    }

    public Page<Store> getItemsByCategory(String category, Pageable pageable) {
        ItemCategory itemCategory = parseItemCategory(category);
        return storeRepository.findByItemCategory(itemCategory, pageable);
    }

    private ItemCategory parseItemCategory(String category) {
        try {
            return ItemCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 아이템 카테고리: " + category);
        }
    }
}
