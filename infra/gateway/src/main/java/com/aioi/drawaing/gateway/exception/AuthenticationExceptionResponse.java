package com.aioi.drawaing.gateway.exception;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"code", "message"})
public record AuthenticationExceptionResponse<T>(
        String code,
        String message
) {

    public static <T> AuthenticationExceptionResponse<T> onFailure(FailureCode failureCode) {
        return new AuthenticationExceptionResponse<>(failureCode.name(), failureCode.getMessage());
    }
}