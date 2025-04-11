package com.aioi.drawaing.authservice.common.code;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    //Redis
    REDIS_CONNECTION_FAILURE(INTERNAL_SERVER_ERROR, "레디스 서버 연결에 실패하였습니다."),
    REDIS_TIMEOUT(INTERNAL_SERVER_ERROR, "레디스 서버 연결에서 시간 초과가 발생하였습니다."),
    //S3
    EMPTY_DATA(BAD_REQUEST, "데이터가 비어있습니다."),
    MISSING_FILE_EXTENSION(BAD_REQUEST, "파일 확장자가 없습니다."),
    UNSUPPORTED_FILE_EXTENSION(BAD_REQUEST, "허용되지 않는 파일 확장자입니다."),
    S3_UPLOAD_ERROR(INTERNAL_SERVER_ERROR, "S3 업로드 중 오류가 발생했습니다."),
    S3_DELETE_ERROR(INTERNAL_SERVER_ERROR, "S3 이미지 삭제 중 오류가 발생했습니다."),
    INVALID_IMAGE_URL(BAD_REQUEST, "S3 이미지 주소를 가져오는 중 오류가 발생했습니다."),
    //Image
    INVALID_REQUEST(BAD_REQUEST, "올바르지 않은 요청입니다."),
    INVALID_IMAGE_FORMAT(BAD_REQUEST, "지원하지 않는 이미지 형식입니다."),
    EXCEED_IMAGE_CAPACITY(BAD_REQUEST, "이미지 크기가 허용된 최대 용량을 초과했습니다."),
    FAIL_IMAGE_UPLOAD(BAD_REQUEST, "이미지 업로드에 실패했습니다."),
    //Sound
    NOT_SOUND(NOT_FOUND, "요청한 음성 파일이 없습니다."),
    FAIL_CONVERT_SOUND(INTERNAL_SERVER_ERROR, "음성 파일 변환에 실패했습니다."),
    //Video

    //Auth

    NOT_SUPPORT_PROVIDER(BAD_REQUEST, "로컬 유저가 아닙니다."),
    INVALID_AUTHORITY(FORBIDDEN, "해당 리소스에 접근할 권한이 없습니다."),
    INVALID_PASSWORD(UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),
    INVALID_JWT_FORMAT(BAD_REQUEST, "JWT 형식이 아닙니다."),
    JWT_NOT_FOUND(NOT_FOUND, "토큰 정보가 없습니다."),
    INVALID_TOKEN_REQUEST(BAD_REQUEST, "잘못된 요청입니다."),
    INVALID_ACCESS_TOKEN(UNAUTHORIZED, "유효하지 않은 AccessToken 입니다."),
    INVALID_REFRESH_TOKEN(UNAUTHORIZED, "유효하지 않은 RefreshToken 입니다."),
    INVALID_AUTHORIZATION_CODE(UNAUTHORIZED, "유효하지 않은 인가 코드 입니다."),
    EXPIRED_ACCESS_TOKEN(UNAUTHORIZED, "만료된 AccessToken 입니다."),
    EXPIRED_REFRESH_TOKEN(UNAUTHORIZED, "만료된 RefreshToken 입니다."),
    FAIL_OAUTH_USERINFO_RETRIEVAL(UNAUTHORIZED, "회원 정보를 가져오는데 실패했습니다."),
    INVALID_USER_LOGGED_IN(UNAUTHORIZED, "로그인이 필요합니다."),

    //Member
    VALIDATION_ERROR(BAD_REQUEST, "올바르지 않은 형식의 값입니다."),
    NOT_FOUND_MEMBER_ID(NOT_FOUND, "요청한 ID에 해당하는 사용자가 존재하지 않습니다."),
    NOT_FOUND_MEMBER_EMAIL(NOT_FOUND, "요청한 이메일에 해당하는 사용자가 존재하지 않습니다."),
    NOT_FOUND_MEMBER_PROFILE_FILE(NOT_FOUND, "요청한 이미지 파일을 찾을 수 없습니다."),
    NON_VALIDATED_PASSWORD(UNAUTHORIZED, "비밀번호가 유효하지 않습니다."),
    ALREADY_EXIST_EMAIL(CONFLICT, "이미 존재하는 이메일 입니다."),
    ALREADY_EXIST_NICKNAME(CONFLICT, "이미 존재하는 닉네임 입니다."),
    NOT_AUTHENTICATED_EMAIL(CONFLICT, "인증되지 않은 이메일 입니다."),
    BLANK_EMAIL_INPUT(BAD_REQUEST, "Email 을 입력해주세요."),
    INVALID_EMAIL_PATTERN(BAD_REQUEST, "올바르지 않은 Email 형식입니다."),
    NOT_ACCEPT_TERMS(CONFLICT, "약관에 동의해주세요."),
    INVALID_PASSWORD_PATTERN(CONFLICT, "올바르지 않은 Password 형식입니다. 8글자 이상 16글자 이하로 작성해주세요."),
    BLANK_PASSWORD_INPUT(BAD_REQUEST, "Password 를 입력해주세요."),
    LOGIN_FAILED(CONFLICT, "아이디와 비밀번호를 확인해주세요."),

    // 이메일 인증
    EMAIL_VERIFICATION_CODE_EXPIRED(UNAUTHORIZED, "인증 코드가 만료되었습니다."),
    EMAIL_VERIFICATION_CODE_MISMATCH(UNAUTHORIZED, "인증 코드가 일치하지 않습니다."),


    // 내부 서버 에러
    SERVER_ERROR(INTERNAL_SERVER_ERROR, "서버 에러가 발생하였습니다.");


    private final HttpStatus status;
    private final String message;

}
