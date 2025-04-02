package com.aioi.drawaing.authservice.member.presentation;

import com.aioi.drawaing.authservice.common.code.ErrorCode;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.member.application.MemberService;
import com.aioi.drawaing.authservice.member.presentation.request.MemberExpUpdateRequest;
import com.aioi.drawaing.authservice.member.presentation.request.MemberInfoUpdateRequest;
import com.aioi.drawaing.authservice.member.presentation.request.MemberReqDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        log.info("회원 정보 조회 memberId: {},  ", memberId);
        return ApiResponseEntity.onSuccess(memberService.get(memberId));
    }

    @Operation(summary = "회원 정보 수정")
    @PatchMapping()
    public ResponseEntity<?> infoUpdate(
            HttpServletRequest request,
            @RequestBody MemberInfoUpdateRequest memberInfoUpdateRequest) {
        Long memberId = Long.parseLong(request.getParameter("member-id"));
        log.info("=====회원 정보 수정=====");
        log.info("memberId: {}", memberId);
        log.info("UpdateRequest: {}", memberInfoUpdateRequest);
        return ApiResponseEntity.onSuccess(memberService.infoUpdate(memberInfoUpdateRequest, memberId));
    }

    @Operation(summary = "회원 경험치 추가")
    @PatchMapping("/exp")
    public ResponseEntity<?> expUpdate(
            @RequestBody List<MemberExpUpdateRequest> memberExpUpdateRequests) {
        memberService.expUpdate(memberExpUpdateRequests);
        log.info("경험치, 포인트 저장 완료");
        return ApiResponseEntity.onSuccess("경험치, 포인트 저장 완료");
    }

    @Operation(summary = "회원 탈퇴")
    @DeleteMapping()
    public ResponseEntity<?> delete(
            HttpServletRequest request) {
        Long memberId = Long.parseLong(request.getParameter("member-id"));
        log.info("회원 탈퇴 memberId: {},  ", memberId);
        memberService.delete(memberId);
        return ApiResponseEntity.onSuccess("회원 탈퇴에 성공하였습니다.");
    }

    @Operation(summary = "회원 가입")
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(
            HttpServletResponse response,
            @RequestBody @Validated MemberReqDto.SignUp signUp
            , Errors errors) {
        // validation check
        if (errors.hasErrors()) {
            log.error("signUp 에러: {}", errors.getAllErrors());
            return ApiResponseEntity.onFailure(ErrorCode.VALIDATION_ERROR);
        }
        log.info("회원 가입: {}", signUp);
        return memberService.signUp(response, signUp);
    }

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<?> login(
            HttpServletResponse response,
            @RequestBody @Validated MemberReqDto.Login login,
            Errors errors) {
        if (errors.hasErrors()) {
            log.error("login 에러: {}", errors.getAllErrors());
            return ApiResponseEntity.onFailure(ErrorCode.VALIDATION_ERROR);
        }
        log.info("로그인: {}", login);
        return memberService.login(response, login);
    }

    @Operation(summary = "게스트 로그인")
    @PostMapping("/guestlogin")
    public ResponseEntity<?> guestLogin(HttpServletRequest request, HttpServletResponse response) {
        return memberService.guestLogin(request, response);
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        return memberService.logout(request, response);
    }
}

