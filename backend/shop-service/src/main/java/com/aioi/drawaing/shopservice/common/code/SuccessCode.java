package com.aioi.drawaing.shopservice.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {

    SUCCESS(HttpStatus.OK, "성공했습니다."),

    //File
    //Image
    //Sound
    //Video

    //Member(2100~2199)
    AUTH_SUCCESS(HttpStatus.REQUEST_TIMEOUT, "사용자 인증 성공했습니다."),
    TOKEN_REFRESHED(HttpStatus.CREATED, "토큰 재발급 성공했습니다."),
    VALID_EMAIL(HttpStatus.OK, "사용 가능한 Email 입니다."),
    SUCCESS_MEMBER_REGISTER(HttpStatus.CREATED, "회원가입에 성공하였습니다."),
    SUCCESS_LOGIN(HttpStatus.OK, "로그인에 성공하였습니다."),
    LOGOUT_SUCCESS(HttpStatus.OK, "로그아웃에 성공하였습니다.")
    ;

    private final HttpStatus status;
    private final String message;
}
