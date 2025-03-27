package com.aioi.drawaing.gateway.jwt;

import com.aioi.drawaing.gateway.dto.MemberInfo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtProvider {
    private final SecretKey secretKey;
    private final RedisTokenService redisTokenService;
    private static final String AUTHORITIES_KEY = "auth";

    public JwtProvider(
            @Value("${jwt.secret}") String secretKey,
            RedisTokenService redisTokenService
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
        this.redisTokenService = redisTokenService;
    }

    public MemberInfo getMemberInfo(String accessToken, String refreshToken) {
        validateTokens(accessToken, refreshToken);

        if (redisTokenService.getToken(refreshToken) == null) {
            throw new RuntimeException();
        }

        String memberId = parseToken(accessToken).getSubject();
        String role = parseToken(accessToken).get(AUTHORITIES_KEY, String.class);
        return new MemberInfo(memberId, role);
    }

    private Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    // 파싱 도중 예외가 발생하면 만료된 토큰으로 취급
    private void validateAccessToken(String accessToken) {
        try {
            parseToken(accessToken);
        } catch (JwtException e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    private void validateRefreshToken(String refreshToken) {
        try {
            parseToken(refreshToken);
        } catch (JwtException e) {
            log.error(e.getMessage());
            throw e;
        }
    }

    private void validateTokens(String accessToken, String refreshToken) {
        validateAccessToken(accessToken);
        validateRefreshToken(refreshToken);
    }
}