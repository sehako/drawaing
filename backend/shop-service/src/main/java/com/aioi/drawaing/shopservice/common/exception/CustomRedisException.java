package com.aioi.drawaing.shopservice.common.exception;

import com.aioi.drawaing.shopservice.common.code.ErrorCode;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomRedisException extends RuntimeException {
    private final ErrorCode errorCode;
}
