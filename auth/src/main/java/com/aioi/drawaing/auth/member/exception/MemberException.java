package com.aioi.drawaing.auth.member.exception;

import com.aioi.drawaing.auth.common.code.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class MemberException extends RuntimeException {
    private final ErrorCode errorCode;
}
