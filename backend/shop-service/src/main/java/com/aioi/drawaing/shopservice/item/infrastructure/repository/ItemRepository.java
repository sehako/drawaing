package com.aioi.drawaing.shopservice.item.infrastructure.repository;

import com.aioi.drawaing.shopservice.item.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
