package com.aioi.drawaing.authservice.member.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class S3Exception extends RuntimeException {
    public S3Exception(String message) {
        super(message);
    }
}
