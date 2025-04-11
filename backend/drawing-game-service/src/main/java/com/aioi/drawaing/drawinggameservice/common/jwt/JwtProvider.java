package com.aioi.drawaing.drawinggameservice.common.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.UnsupportedJwtException;
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
    private static final String AUTHORITIES_KEY = "auth";

    public JwtProvider(
            @Value("${jwt.secret}") String secretKey
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    public String getUserId(String accessToken) {
//        validateTokens(accessToken, refreshToken);

//        if (redisTokenService.getToken(refreshToken) == null) {
//            throw new RuntimeException();
//        }
        return parseToken(accessToken).getSubject();
    }

//    public UsernamePasswordAuthenticationToken getAuthentication(String accessToken, String refreshToken) {
//        validateTokens(accessToken, refreshToken);
//        Claims claims = parseToken(accessToken);
//
//        if (claims.get(AUTHORITIES_KEY) == null) {
//            throw new RuntimeException("권한 정보가 없는 토큰입니다.");
//        }
//
//        Collection<? extends GrantedAuthority> authorities =
//                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
//                        .map(SimpleGrantedAuthority::new)
//                        .toList();
//
//        if (redisTokenService.getToken(claims.getSubject()) == null) {
//            throw new RuntimeException();
//        }
//
//        UserDetails principal = new User(claims.getSubject(), "", authorities);
//        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
//    }


    private Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (UnsupportedJwtException | IllegalArgumentException e) {
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
