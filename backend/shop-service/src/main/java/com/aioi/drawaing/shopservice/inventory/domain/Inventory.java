package com.aioi.drawaing.shopservice.inventory.domain;

import com.aioi.drawaing.shopservice.item.domain.Item;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventory")
@Builder
@AllArgsConstructor
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 0;

    public void addQuantity(int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException();
        }
        this.quantity += quantity;
    }

    public void reduceQuantity(int quantity) {
        if (this.quantity - quantity < 0) {
            throw new RuntimeException();
        }
        this.quantity -= quantity;
    }
}

