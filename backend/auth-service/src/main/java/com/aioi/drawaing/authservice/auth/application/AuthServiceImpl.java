package com.aioi.drawaing.authservice.auth.application;

import static com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider.getRefreshTokenExpireTimeCookie;
import static com.aioi.drawaing.authservice.oauth.infrastructure.repository.OAuth2AuthorizationRequestBasedOnCookieRepository.REFRESH_TOKEN;

import com.aioi.drawaing.authservice.auth.presentation.dto.EmailRequest;
import com.aioi.drawaing.authservice.auth.presentation.dto.EmailVerificationRequest;
import com.aioi.drawaing.authservice.auth.domain.VerificationCodeCache;
import com.aioi.drawaing.authservice.auth.infrastructure.repository.VerificationCodeCacheRepository;
import com.aioi.drawaing.authservice.common.constant.EmailTemplate;
import com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider;
import com.aioi.drawaing.authservice.common.jwt.TokenInfo;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.common.util.CodeGenerator;
import com.aioi.drawaing.authservice.common.util.CookieUtil;
import com.aioi.drawaing.authservice.common.util.EmailSender;
import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.member.infrastructure.repository.MemberRepository;
import com.aioi.drawaing.authservice.oauth.domain.entity.RoleType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;

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
            throw new IllegalStateException("이미 사용 중인 닉네임입니다. 닉네임: " + nickname);
        });
    }

    @Override
    public void checkEmailDuplication(String email) {
        memberRepository.findByEmail(email).ifPresent(member -> {
            throw new IllegalStateException("이미 사용 중인 이메일입니다. 이메일: " + email);
        });
    }

    @Override
    @Transactional
    public void sendEmailCode(EmailRequest emailRequest) {
        checkEmailDuplication(emailRequest.email());

        String code = codeGenerator.generateCode();
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
                .orElseThrow(() -> new IllegalArgumentException("인증 코드가 만료되었습니다."));

        if (!verificationCodeCache.getCode().equals(emailVerificationRequest.code())) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
        } else {
            verificationCodeCache.verify();
            verificationCodeCacheRepository.save(verificationCodeCache);
        }
    }

    @Override
    @Transactional
    public void sendEmailPassword(EmailRequest emailRequest) {
        Member member = memberRepository.findByEmail(emailRequest.email())
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일을 가진 유저가 존재하지 않습니다."));

        String password = codeGenerator.generateCode();
        String text = emailSender.buildTextForVerificationCode(EmailTemplate.EMAIL_PASSWORD_CONTENT, password);

        emailSender.sendVerificationCode(emailRequest.email(), EmailTemplate.EMAIL_PASSWORD_SUBJECT, text);

        member.setPassword(passwordEncoder.encode(password));

        memberRepository.save(member);
    }

    @Override
    public ResponseEntity<?> getSocialType(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일을 가진 유저가 존재하지 않습니다."));

        return ResponseEntity.ok(member.getProviderType());
    }

    @Override
    public ResponseEntity<?> reissue(HttpServletRequest request, HttpServletResponse response) {

        // 1. 쿠키에서 Refresh Token 가져오기
        String refreshToken = CookieUtil.getCookie(request, REFRESH_TOKEN).map(Cookie::getValue)
                .orElseThrow(() -> new IllegalArgumentException("Refresh Token 정보가 없습니다"));

        // 2. Refresh Token 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ApiResponseEntity.badRequest("Refresh Token 정보가 유효하지 않습니다.");
        }
        // 3. 리프레시 토큰 복호화
        String memberEmail = jwtTokenProvider.extractIdFromToken(refreshToken);

        // 4. Redis 에서 User email 을 기반으로 저장된 Refresh Token 값을 가져옵니다.
        String redisRefreshToken = redisTemplate.opsForValue().get("RT:" + memberEmail);
        // (추가) 로그아웃되어 Redis 에 RefreshToken 이 존재하지 않는 경우 처리
        if (ObjectUtils.isEmpty(redisRefreshToken)) {
            return ApiResponseEntity.badRequest("잘못된 요청입니다.");
        }
        if (!redisRefreshToken.equals(refreshToken)) {
            return ApiResponseEntity.badRequest("Refresh Token 정보가 일치하지 않습니다.");
        }

        // 5. 새로운 토큰 생성
        TokenInfo tokenInfo = jwtTokenProvider.generateToken(memberEmail, RoleType.ROLE_USER.name());

        // 8. RefreshToken Redis 업데이트
        redisTemplate.opsForValue().set("RT:" + memberEmail, tokenInfo.getRefreshToken(),
                tokenInfo.getRefreshTokenExpirationTime(), TimeUnit.MILLISECONDS);

        // 9. 쿠키에 Refresh Token 저장
        CookieUtil.addCookie(response, REFRESH_TOKEN, tokenInfo.getRefreshToken(),
                getRefreshTokenExpireTimeCookie());

        return ResponseEntity.ok(tokenInfo);
    }
}