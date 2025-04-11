package com.aioi.drawaing.authservice.auth.application;

import static com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider.getRefreshTokenExpireTimeCookie;
import static com.aioi.drawaing.authservice.oauth.infrastructure.repository.OAuth2AuthorizationRequestBasedOnCookieRepository.REFRESH_TOKEN;

import com.aioi.drawaing.authservice.auth.domain.VerificationCodeCache;
import com.aioi.drawaing.authservice.auth.infrastructure.repository.VerificationCodeCacheRepository;
import com.aioi.drawaing.authservice.auth.presentation.dto.EmailRequest;
import com.aioi.drawaing.authservice.auth.presentation.dto.EmailVerificationRequest;
import com.aioi.drawaing.authservice.common.code.ErrorCode;
import com.aioi.drawaing.authservice.common.constant.EmailTemplate;
import com.aioi.drawaing.authservice.common.exception.CustomJwtException;
import com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider;
import com.aioi.drawaing.authservice.common.jwt.TokenInfo;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.common.util.CodeGenerator;
import com.aioi.drawaing.authservice.common.util.CookieUtil;
import com.aioi.drawaing.authservice.common.util.EmailSender;
import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.member.exception.MemberException;
import com.aioi.drawaing.authservice.member.infrastructure.repository.MemberRepository;
import com.aioi.drawaing.authservice.oauth.domain.entity.RoleType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthServiceImpl implements com.aioi.drawaing.authservice.auth.application.AuthService {
    private final MemberRepository memberRepository;
    private final VerificationCodeCacheRepository verificationCodeCacheRepository;
    private final EmailSender emailSender;
    private final CodeGenerator codeGenerator;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void checkNicknameDuplication(String nickname) {
        memberRepository.findByNickname(nickname).ifPresent(member -> {
            throw new MemberException(ErrorCode.ALREADY_EXIST_NICKNAME);
        });
    }

    @Override
    public void checkEmailDuplication(String email) {
        memberRepository.findByEmail(email).ifPresent(member -> {
            throw new MemberException(ErrorCode.ALREADY_EXIST_EMAIL);
        });
    }

    @Override
    @Transactional
    @Async(value = "mailExecutor")
    public void sendEmailCode(EmailRequest emailRequest) {
        checkEmailDuplication(emailRequest.email());

        String code = codeGenerator.generateCode();
        log.info("email code: {}", code);
        String text = emailSender.buildTextForVerificationCode(EmailTemplate.EMAIL_VERIFICATION_CONTENT, code);

        emailSender.sendVerificationCode(emailRequest.email(), EmailTemplate.EMAIL_VERIFICATION_SUBJECT, text);
        verificationCodeCacheRepository.save(VerificationCodeCache.builder()
                .email(emailRequest.email())
                .code(code)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Override
    @Transactional
    public void verifyEmailCode(EmailVerificationRequest emailVerificationRequest) {
        VerificationCodeCache verificationCodeCache = verificationCodeCacheRepository.findValidCode(
                        emailVerificationRequest.email())
                .orElseThrow(() -> new MemberException(ErrorCode.EMAIL_VERIFICATION_CODE_EXPIRED));

        log.info("verificationCodeCache: {}", verificationCodeCache);
        log.info("emailVerificationRequest: {}", emailVerificationRequest.code());
        if (!verificationCodeCache.getCode().equals(emailVerificationRequest.code())) {
            throw new MemberException(ErrorCode.EMAIL_VERIFICATION_CODE_MISMATCH);
        } else {
            verificationCodeCache.verify();
            verificationCodeCacheRepository.save(verificationCodeCache);
        }
    }

    @Override
    @Transactional
    public void sendEmailPassword(EmailRequest emailRequest) {
        Member member = memberRepository.findByEmail(emailRequest.email())
                .orElseThrow(() -> new MemberException(ErrorCode.NOT_FOUND_MEMBER_EMAIL));

        String password = codeGenerator.generateCode();
        String text = emailSender.buildTextForVerificationCode(EmailTemplate.EMAIL_PASSWORD_CONTENT, password);

        emailSender.sendVerificationCode(emailRequest.email(), EmailTemplate.EMAIL_PASSWORD_SUBJECT, text);

        member.setPassword(passwordEncoder.encode(password));

        memberRepository.save(member);
    }

    @Override
    public ResponseEntity<?> getSocialType(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(ErrorCode.NOT_FOUND_MEMBER_EMAIL));

        return ApiResponseEntity.onSuccess(member.getProviderType());
    }

    @Override
    public ResponseEntity<?> reissue(HttpServletRequest request, HttpServletResponse response) {

        // 1. 쿠키에서 Refresh Token 가져오기
        String refreshToken = CookieUtil.getCookie(request, REFRESH_TOKEN).map(Cookie::getValue)
                .orElseThrow(() -> new CustomJwtException(ErrorCode.JWT_NOT_FOUND));

        // 2. Refresh Token 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ApiResponseEntity.onFailure(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 3. 리프레시 토큰 복호화
        Long memberId = jwtTokenProvider.extractIdFromToken(refreshToken);

        // 4. Redis 에서 MemberId 를 기반으로 저장된 Refresh Token 값을 가져옵니다.
        String redisRefreshToken = redisTemplate.opsForValue().get("RT:" + memberId);

        // (추가) 로그아웃되어 Redis에 RefreshToken이 존재하지 않는 경우 처리
        if (ObjectUtils.isEmpty(redisRefreshToken)) {
            return ApiResponseEntity.onFailure(ErrorCode.INVALID_REQUEST);
        }

        if (!redisRefreshToken.equals(refreshToken)) {
            return ApiResponseEntity.onFailure(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 5. 새로운 토큰 생성
        TokenInfo tokenInfo = jwtTokenProvider.generateToken(memberId, RoleType.ROLE_USER.name());

        // 8. RefreshToken Redis 업데이트
        redisTemplate.opsForValue().set("RT:" + memberId, tokenInfo.getRefreshToken(),
                tokenInfo.getRefreshTokenExpirationTime(), TimeUnit.MILLISECONDS);

        // 9. 쿠키에 Refresh Token 저장
        CookieUtil.addCookie(response, REFRESH_TOKEN, tokenInfo.getRefreshToken(),
                getRefreshTokenExpireTimeCookie());

        return ApiResponseEntity.onSuccess(tokenInfo);
    }
}