package com.aioi.drawaing.authservice.common.exception;

import com.aioi.drawaing.authservice.common.code.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CustomJwtException extends RuntimeException {
  private final ErrorCode errorCode;
}