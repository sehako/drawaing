package com.aioi.drawaing.shopservice.store.presentation;

import com.aioi.drawaing.shopservice.item.domain.ItemCategory;
import com.aioi.drawaing.shopservice.store.application.StoreService;
import com.amazonaws.services.ec2.model.PurchaseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
public class StoreController {
    private final StoreService storeService;
    private final PurchaseService purchaseService;

    @GetMapping("/items")
    public ResponseEntity<Page<StoreResponse>> getItemsByCategory(
            @RequestParam ItemCategory category,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(storeService.getItemsByCategory(category, pageable));
    }

    @PostMapping("/purchase")
    public ResponseEntity<Void> purchaseItem(@RequestBody PurchaseRequest request) {
        purchaseService.processPurchase(request.memberId(), request.itemId(), request.quantity());
        return ResponseEntity.ok().build();
    }
}

