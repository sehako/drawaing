package com.aioi.drawaing.shopservice.store.infrastructure.repository;

import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import com.aioi.drawaing.shopservice.store.domain.Store;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StoreRepository extends JpaRepository<Store, Long> {
    @Query("SELECT s FROM Store s JOIN FETCH s.item i WHERE i.category = :category")
    Page<Store> findByItemCategory(@Param("category") ItemCategory category, Pageable pageable);

    Optional<Store> findByItem_ItemId(Long itemId);
}