package com.aioi.drawaing.shopservice.store.domain;

import com.aioi.drawaing.shopservice.item.domain.Item;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "store")
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    @OneToOne
    @JoinColumn(name = "item_id", unique = true)
    private Item item;

    private Integer price;
    private Boolean isQuantityLimited;
    private Integer remainingQuantity;
    private Integer soldQuantity;

    public void updateQuantity(Integer quantity) {
        if (this.isQuantityLimited) {
            this.remainingQuantity = Math.max(this.remainingQuantity - quantity, 0);
        }
        this.soldQuantity += quantity;
    }
}
