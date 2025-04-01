package com.aioi.drawaing.shopservice.store.presentation;

import com.aioi.drawaing.shopservice.store.application.PurchaseService;
import com.aioi.drawaing.shopservice.store.application.StoreService;
import com.aioi.drawaing.shopservice.store.domain.Store;
import com.aioi.drawaing.shopservice.store.presentation.request.PurchaseRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    public ResponseEntity<List<Store>> getAllItems() {
        return ResponseEntity.ok(storeService.getAllItems());
    }

    @GetMapping("/items")
    public ResponseEntity<Page<Store>> getItemsByCategory(
            @RequestParam String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(storeService.getItemsByCategory(category, PageRequest.of(page, size)));
    }

    @PostMapping("/purchase")
    public ResponseEntity<Void> purchaseItem(@RequestBody PurchaseRequest request) {
        purchaseService.processPurchase(request.memberId(), request.itemId(), request.quantity());
        return ResponseEntity.ok().build();
    }
}

