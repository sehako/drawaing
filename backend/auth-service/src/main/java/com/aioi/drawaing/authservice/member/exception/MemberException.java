package com.aioi.drawaing.authservice.member.exception;

import com.aioi.drawaing.authservice.common.code.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class MemberException extends RuntimeException {
    private final ErrorCode errorCode;
}
