package com.aioi.drawaing.auth.common.exception;

import com.aioi.drawaing.auth.common.code.ErrorCode;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomRedisException extends RuntimeException {
    private final ErrorCode errorCode;
}
