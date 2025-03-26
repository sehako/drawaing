package com.aioi.drawaing.authservice.common.response;

import com.aioi.drawaing.authservice.common.code.ErrorCode;
import com.aioi.drawaing.authservice.common.code.SuccessCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ApiResponseEntity {
    public static <T> ResponseEntity<ApiResponse<T>> onSuccess(T result) {
        return ResponseEntity.ok().body(new ApiResponse<>(SuccessCode.SUCCESS.name(), SuccessCode.SUCCESS.getMessage(), result));
    }

    public static <T> ResponseEntity<ApiResponse<T>> from(SuccessCode code, T result) {
        return ResponseEntity.ok().body(new ApiResponse<>(code.name(), code.getMessage(), result));
    }

    public static <T> ResponseEntity<ApiResponse<T>> onFailure(ErrorCode code) {
        return ResponseEntity.ok().body(new ApiResponse<>(code.name(), code.getMessage(), null));
    }
}
