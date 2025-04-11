package com.aioi.drawaing.gateway.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FailureCode {
    UNAUTHORIZED_TOKEN("유효하지 않은 엑세스 토큰이거나 리프레시 토큰입니다!"),
    NO_ACCESS_TOKEN("엑세스 토큰이 전달되지 않았습니다!"),
    NO_REFRESH_TOKEN("리프레시 토큰이 전달되지 않았습니다!"),
    ;

    private final String message;
}
