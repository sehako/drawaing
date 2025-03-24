package com.aioi.drawaing.authservice.common.exception;

import static com.aioi.drawaing.authservice.common.code.ErrorCode.*;

import com.aioi.drawaing.authservice.common.response.ApiResponse;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.member.exception.MemberException;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    //Valid 에러 핸들러
//    @Override
//    protected ResponseEntity<Object> handleMethodArgumentNotValid(
//            final MethodArgumentNotValidException e,
//            final HttpHeaders headers,
//            final HttpStatusCode status,
//            final WebRequest request
//    ) {
//        log.warn(e.getMessage(), e);
//        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
//        log.warn(message);
//        return ApiResponseEntity.onFailure(INVALID_REQUEST);
//    }
    @ExceptionHandler(GlobalException.class)
    ResponseEntity<?> globalExceptionHandler(GlobalException e){
        return ApiResponseEntity.onFailure(e.getErrorCode());
    }

    @ExceptionHandler(MemberException.class)
    ResponseEntity<?> globalExceptionHandler(MemberException e){
        return ApiResponseEntity.onFailure(e.getErrorCode());
    }

    @ExceptionHandler(CustomJwtException.class)
    ResponseEntity<?> globalExceptionHandler(CustomJwtException e){
        return ApiResponseEntity.onFailure(e.getErrorCode());
    }

    @ExceptionHandler(IOException.class)
    ResponseEntity<?> globalExceptionHandler(IOException e){
        return ApiResponseEntity.onFailure(FAIL_IMAGE_UPLOAD);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(final Exception e){
        log.error(e.getMessage(), e);
        return ApiResponseEntity.onFailure(SERVER_ERROR);
    }
}
