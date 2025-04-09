package com.aioi.drawaing.shopservice.common.response;

import com.aioi.drawaing.shopservice.common.code.ErrorCode;
import com.aioi.drawaing.shopservice.common.code.SuccessCode;
import org.springframework.http.ResponseEntity;

public class ApiResponseEntity {
    public static <T> ResponseEntity<ApiResponse<T>> onSuccess(T result) {
        return ResponseEntity.ok()
                .body(new ApiResponse<>(SuccessCode.SUCCESS.name(), SuccessCode.SUCCESS.getMessage(), result));
    }

    public static <T> ResponseEntity<ApiResponse<T>> from(SuccessCode code, T result) {
        return ResponseEntity.status(code.getStatus()).body(new ApiResponse<>(code.name(), code.getMessage(), result));
    }

    public static <T> ResponseEntity<ApiResponse<T>> onFailure(ErrorCode code) {
        return ResponseEntity.status(code.getStatus()).body(new ApiResponse<>(code.name(), code.getMessage(), null));
    }
}
