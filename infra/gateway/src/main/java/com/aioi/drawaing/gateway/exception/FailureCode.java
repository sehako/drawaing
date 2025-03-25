package com.aioi.drawaing.gateway.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FailureCode {
    UNAUTHORIZED_TOKEN("인증 과정에서 문제가 발생했습니다!"),
    ;

    private final String message;
}
