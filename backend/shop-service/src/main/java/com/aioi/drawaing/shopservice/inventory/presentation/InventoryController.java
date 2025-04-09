package com.aioi.drawaing.shopservice.inventory.presentation;


import com.aioi.drawaing.shopservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.shopservice.inventory.application.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{memberId}")
    public ResponseEntity<?> getInventory(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("인벤토리 조회 요청 memberId : {}, page : {}, size : {} ", memberId, page, size);
        return ApiResponseEntity.onSuccess(
                inventoryService.getInventoryByMemberId(memberId, PageRequest.of(page, size)));
    }
}
