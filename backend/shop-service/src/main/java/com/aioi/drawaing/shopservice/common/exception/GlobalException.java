package com.aioi.drawaing.shopservice.common.exception;

import com.aioi.drawaing.shopservice.common.code.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class GlobalException extends RuntimeException{
    private final ErrorCode errorCode;
}
