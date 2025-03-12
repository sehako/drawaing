package com.aioi.drawaing.auth.common.exception;

import com.aioi.drawaing.auth.common.code.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CustomJwtException extends RuntimeException {
  private final ErrorCode errorCode;
}