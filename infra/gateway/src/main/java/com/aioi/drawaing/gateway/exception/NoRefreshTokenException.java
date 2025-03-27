package com.aioi.drawaing.gateway.exception;

public class NoRefreshTokenException extends RuntimeException {
    public NoRefreshTokenException(String message) {
        super(message);
    }
}
