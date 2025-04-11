package com.aioi.drawaing.authservice.common.exception;

import com.aioi.drawaing.authservice.common.code.ErrorCode;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomRedisException extends RuntimeException {
    private final ErrorCode errorCode;
}
