package com.aioi.drawaing.authservice.member.presentation;

import com.aioi.drawaing.authservice.common.code.ErrorCode;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.member.application.MemberService;
import com.aioi.drawaing.authservice.member.presentation.request.MemberReqDto;
import com.aioi.drawaing.authservice.member.presentation.request.MemberUpdateRequest;
import com.aioi.drawaing.authservice.member.presentation.response.MemberResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/member")
@Tag(name = "회원", description = "회원 API")
public class MemberController {
    private final MemberService memberService;

    @Operation(summary = "회원 정보 조회")
    @GetMapping("/{member_id}")
    public ResponseEntity<?> get(@PathVariable("member_id") Long memberId) {
        return ApiResponseEntity.onSuccess(memberService.get(memberId));
    }

    @Operation(summary = "회원 정보 수정")
    @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(@RequestBody MemberUpdateRequest memberUpdateRequest) {
        return ApiResponseEntity.onSuccess(memberService.update(memberUpdateRequest));
    }

    @Operation(summary = "회원 탈퇴")
    @DeleteMapping
    public ResponseEntity<?> delete() {
        memberService.delete();
        return ApiResponseEntity.onSuccess("회원 탈퇴에 성공하였습니다.");
    }

    @Operation(summary = "로그인 되어있는 멤버ID 조회")
    @GetMapping("/id")
    public ResponseEntity<?> getUser() {
        return ApiResponseEntity.onSuccess(memberService.getMemberId());
    }


    @Operation(summary = "회원가입")
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody @Validated MemberReqDto.SignUp signUp
            , Errors errors) {
        // validation check
        if (errors.hasErrors()) {
            log.error("signUp 에러 : {}", errors.getAllErrors());
            return ApiResponseEntity.onFailure(ErrorCode.VALIDATION_ERROR);
        }
        log.info("signUp : {}", signUp);
        return memberService.signUp(signUp);
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<?> login(
            HttpServletResponse response,
            @RequestBody @Validated MemberReqDto.Login login,
            Errors errors) {
        // validation  check
        log.info(login.toString());
        if (errors.hasErrors()) {
            log.error("login 에러 : {}", errors.getAllErrors());
            return ApiResponseEntity.onFailure(ErrorCode.VALIDATION_ERROR);
        }
        return memberService.login(response, login);
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        return memberService.logout(request, response);
    }
}

