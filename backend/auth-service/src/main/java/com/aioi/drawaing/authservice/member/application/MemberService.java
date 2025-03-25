package com.aioi.drawaing.authservice.member.application;

import static com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider.getRefreshTokenExpireTimeCookie;
import static com.aioi.drawaing.authservice.oauth.infrastructure.repository.OAuth2AuthorizationRequestBasedOnCookieRepository.REFRESH_TOKEN;

import com.aioi.drawaing.authservice.auth.domain.VerificationCodeCache;
import com.aioi.drawaing.authservice.auth.infrastructure.repository.VerificationCodeCacheRepository;
import com.aioi.drawaing.authservice.common.code.ErrorCode;
import com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider;
import com.aioi.drawaing.authservice.common.jwt.TokenInfo;
import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.common.util.CookieUtil;
import com.aioi.drawaing.authservice.common.util.HeaderUtil;
import com.aioi.drawaing.authservice.common.util.S3ImageUploader;
import com.aioi.drawaing.authservice.common.util.SecurityUtil;
import com.aioi.drawaing.authservice.member.presentation.request.MemberReqDto.Login;
import com.aioi.drawaing.authservice.member.presentation.request.MemberReqDto.SignUp;
import com.aioi.drawaing.authservice.member.application.response.MemberLoginResponse;
import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.member.infrastructure.repository.MemberRepository;
import com.aioi.drawaing.authservice.member.presentation.request.MemberUpdateRequest;
import com.aioi.drawaing.authservice.member.presentation.response.MemberResponse;
import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import com.aioi.drawaing.authservice.oauth.domain.entity.RoleType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.QueryTimeoutException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final S3ImageUploader s3ImageUploader;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final VerificationCodeCacheRepository verificationCodeCacheRepository;

    public MemberResponse get(long memberId) {
        Member member = memberRepository.findMemberById(memberId).orElseThrow();
        log.info(member.getEmail());
        return MemberResponse.of(member);
    }

    public Long getMemberId() {
        String memberEmail = SecurityUtil.getCurrentMemberEmail();
        return memberRepository.findByEmail(memberEmail).orElseThrow().getId();
    }

    @Transactional
    public MemberResponse update(MemberUpdateRequest memberUpdateRequest) {
        Member member = getMember();

        Member updated = memberRepository.saveAndFlush(member.toBuilder()
                .nickname(memberUpdateRequest.nickname() == null
                        ? member.getNickname() : memberUpdateRequest.nickname())
                .characterImage(memberUpdateRequest.characterImageUrl() == null
                        ? member.getCharacterImage() : memberUpdateRequest.characterImageUrl())
                .password(memberUpdateRequest.password() == null
                        ? member.getPassword() : passwordEncoder.encode(memberUpdateRequest.password()))
                .build());

        return MemberResponse.of(updated);
    }

    @Transactional
    public void delete() {
        Member member = getMember();
        member.updateDeleted();
        memberRepository.saveAndFlush(member);
    }

    public Member getMember() {
        String memberEmail = SecurityUtil.getCurrentMemberEmail();
        return memberRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 입니다. 회원 Email: " + memberEmail));
    }

    @Transactional
    public ResponseEntity<?> signUp(SignUp signUp) {
        if (memberRepository.existsByEmail(signUp.getEmail())) {
            return ApiResponseEntity.onFailure(ErrorCode.ALREADY_EXIST_EMAIL);
        }
        //이메일 인증
        VerificationCodeCache verificationCodeCache = verificationCodeCacheRepository.findByEmail(
                        signUp.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("인증이 만료되었습니다."));
        if (!verificationCodeCache.getVerified()) {
            return ApiResponseEntity.onFailure(ErrorCode.NOT_AUTHENTICATED_EMAIL);
        }
        String nickname = signUp.getNickname();
        Member member = Member.builder()
                .email(signUp.getEmail())
                .nickname(nickname.substring(0, Math.min(15, nickname.length())))
                .password(passwordEncoder.encode(signUp.getPassword()))
                .role(RoleType.ROLE_USER)
                .providerType(ProviderType.LOCAL)
                // 기본 캐릭터 이미지 넣어줄 예정
                .build();

        memberRepository.save(member);

        return ApiResponseEntity.ok("회원가입에 성공하였습니다.");
    }

    @Transactional
    public ResponseEntity<?> login(HttpServletResponse response, Login login) {
        try {
            Member member = validateUser(login.getEmail(), login.getPassword());

            if (member.getProviderType() != ProviderType.LOCAL) {
                return ApiResponseEntity.badRequest("소셜 로그인을 이용해주세요.");
            }

            // 토큰 생성
            TokenInfo tokenInfo = jwtTokenProvider.generateToken(login.getEmail(), RoleType.ROLE_USER.name());

            // Redis에 RefreshToken 저장
            storeRefreshTokenInRedis(login.getEmail(), tokenInfo);

            log.info("로그인 토큰 생성 Access Token: " + tokenInfo.getAccessToken());
            log.info("로그인 토큰 생성 Refresh Token: " + tokenInfo.getRefreshToken());
            // 쿠키에 Refresh Token 저장
            CookieUtil.addCookie(response, REFRESH_TOKEN, tokenInfo.getRefreshToken(),
                    getRefreshTokenExpireTimeCookie());

            MemberLoginResponse memberLoginResponse = MemberLoginResponse.of(member, tokenInfo.getAccessToken());

            return ResponseEntity.ok(memberLoginResponse);
        } catch (BadCredentialsException e) {
            log.error("Login failed: Invalid credentials - {}", e.getMessage());
            return ApiResponseEntity.badRequest("비밀번호가 일치하지 않습니다.");
        } catch (RedisConnectionFailureException e) {
            log.error("Login failed: Redis connection error - {}", e.getMessage());
            return ApiResponseEntity.badRequest("레디스 서버 연결에 실패하였습니다.");
        } catch (QueryTimeoutException e) {
            log.error("Login failed: Redis timeout error - {}", e.getMessage());
            return ApiResponseEntity.badRequest("레디스 서버 연결에서 시간 초과가 발생하였습니다.");
        }
    }

    @Transactional
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {

        // 1. Request Header 에서 Access Token 추출
        String accessToken = HeaderUtil.getAccessToken(request);

        // 2. Access Token 검증
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return ApiResponseEntity.badRequest("잘못된 요청입니다.");
        }

        // 3. Access Token 에서 Member 정보를 가져옵니다.
        Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);

        // 4. Redis 에서 해당 User email 로 저장된 Refresh Token 이 있는지 여부를 확인 후 있을 경우 삭제합니다.
        if (redisTemplate.opsForValue().get("RT:" + authentication.getName()) != null) {
            // Refresh Token 삭제
            redisTemplate.delete("RT:" + authentication.getName());
        }
        // 5. 쿠키에서 Refresh Token 삭제
        CookieUtil.deleteCookie(request, response, REFRESH_TOKEN);

        // 6. 해당 Access Token 유효시간 가지고 와서 BlackList 로 저장하기
        Long expiration = jwtTokenProvider.getExpiration(accessToken);
        redisTemplate.opsForValue().set(accessToken, "logout", expiration, TimeUnit.MILLISECONDS);

        return ApiResponseEntity.ok("로그아웃 되었습니다.");
    }

    private Member validateUser(String email, String password) {
        // 1. 이메일로 사용자 조회
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당하는 유저가 존재하지 않습니다."));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 인증 성공 시 사용자 반환
        return member;
    }

    private void storeRefreshTokenInRedis(String username, TokenInfo tokenInfo) {
        redisTemplate.opsForValue().set(
                "RT:" + username,
                tokenInfo.getRefreshToken(),
                tokenInfo.getRefreshTokenExpirationTime(),
                TimeUnit.MILLISECONDS
        );
        log.info("Redis refresh token stored: {}", redisTemplate.keys("RT:*"));
    }
}
