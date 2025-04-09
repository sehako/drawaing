package com.aioi.drawaing.shopservice.inventory.infrastructure.repository;

import com.aioi.drawaing.shopservice.inventory.domain.Inventory;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // JPQL: 회원 ID와 아이템 ID로 Inventory 조회
    @Query("SELECT i FROM Inventory i WHERE i.memberId = :memberId AND i.item.itemId = :itemId")
    Optional<Inventory> findByMemberIdAndItemId(@Param("memberId") Long memberId, @Param("itemId") Long itemId);

    // JPQL: 회원 ID로 해당 회원의 모든 Inventory 조회 (페이징 지원)
    @Query("SELECT i FROM Inventory i JOIN FETCH i.item WHERE i.memberId = :memberId")
    Page<Inventory> findByMemberId(@Param("memberId") Long memberId, Pageable pageable);
}
