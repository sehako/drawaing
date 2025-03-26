package com.aioi.drawaing.authservice.auth.presentation;

import com.aioi.drawaing.authservice.auth.presentation.dto.EmailRequest;
import com.aioi.drawaing.authservice.auth.presentation.dto.EmailVerificationRequest;
import com.aioi.drawaing.authservice.auth.exception.DuplicateResourceException;
import com.aioi.drawaing.authservice.auth.application.AuthService;
import com.aioi.drawaing.authservice.common.code.ErrorCode;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/member")
@RequiredArgsConstructor
@Tag(name = "인증", description = "인증 API")
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "토큰 재발급", responses = {
            @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
            @ApiResponse(responseCode = "400", description = "토큰 재발급 실패"),
    })
    @PostMapping("/token")
    public ResponseEntity<?> reissue(
            HttpServletRequest request,
            HttpServletResponse response) {
        return authService.reissue(request, response);
    }

    @Operation(summary = "소셜 가입 여부 확인 API")
    @GetMapping(value = "/social/{email}")
    public ResponseEntity<?> getSocialType(
            @Parameter(description = "회원 이메일", required = true, example = "ssafy123@gmail.com")
            @PathVariable String email) {
        try {
            log.info("소셜 여부 확인 API");
            return authService.getSocialType(email);
        } catch (NoSuchElementException e) {
            log.error(e.getMessage());
            return ApiResponseEntity.onFailure(ErrorCode.INVALID_REQUEST);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ApiResponseEntity.onFailure(ErrorCode.SERVER_ERROR);
        }
    }

    @Operation(summary = "닉네임 중복 확인")
    @GetMapping("/nickname/duplication")
    public ResponseEntity<?> checkNicknameDuplication(@RequestParam("nickname") String nickname) {
        try {
            authService.checkNicknameDuplication(nickname);
            return ApiResponseEntity.onSuccess("사용 가능한 닉네임 입니다.");
        } catch (DuplicateResourceException e) {
            return ResponseEntity.badRequest()
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                    .body("이미 사용 중인 닉네임입니다.");
        }
    }

    @Operation(summary = "이메일 중복 확인")
    @GetMapping("/email/duplication")
    public ResponseEntity<?> checkEmailDuplication(@RequestParam("email") String email) {
        try {
            authService.checkEmailDuplication(email);
            return ApiResponseEntity.onSuccess("사용 가능한 이메일 입니다.");
        } catch (DuplicateResourceException e) {
            return ResponseEntity.badRequest()
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                    .body("이미 사용 중인 이메일입니다.");
        }
    }

    @Operation(summary = "이메일 인증 코드 전송")
    @PostMapping("/email/code")
    public ResponseEntity<?> sendEmailCode(@RequestBody EmailRequest emailRequest) {
        authService.sendEmailCode(emailRequest);
        return ApiResponseEntity.onSuccess(null);
    }

    @Operation(summary = "이메일 인증 코드 확인")
    @PostMapping("/email/authentication")
    public ResponseEntity<?> verifyEmailCode(@RequestBody EmailVerificationRequest emailVerificationRequest) {
        authService.verifyEmailCode(emailVerificationRequest);
        return ApiResponseEntity.onSuccess("이메일 인증에 성공하였습니다.");
    }

    @Operation(summary = "임시 비밀번호 전송")
    @PostMapping("/email/password")
    public ResponseEntity<?> sendEmailPassword(@RequestBody EmailRequest emailRequest) {
        authService.sendEmailPassword(emailRequest);
        return ApiResponseEntity.onSuccess(null);
    }
}
