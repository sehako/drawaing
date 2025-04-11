package com.aioi.drawaing.drawinggameservice.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SuccessStatus {

    CREATED_ROOM(HttpStatus.CREATED, "방 생성에 성공했습니다."),
    ROOM_CODE_FOUND(HttpStatus.FOUND, "방 코드 찾기에 성공했습니다.")
    ;

    private final HttpStatus httpStatus;
    private final String message;
}
