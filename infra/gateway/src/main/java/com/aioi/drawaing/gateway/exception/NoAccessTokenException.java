package com.aioi.drawaing.gateway.exception;

public class NoAccessTokenException extends RuntimeException {
    public NoAccessTokenException(String message) {
        super(message);
    }
}
