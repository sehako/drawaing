package com.aioi.drawaing.authservice.common.jwt;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class JwtTokenProvider {

    // 토큰 제작용 Url (없어도 무방)
    private final String serverUrl = "http://localhost:8080";
    private final String clientUrl = "http://localhost:5173";

    private static final String AUTHORITIES_KEY = "auth";
    private static final String BEARER_TYPE = "Bearer";
    @Value("${jwt.access-token-expiration-time}")
    private long ACCESS_TOKEN_EXPIRE_TIME; // 1시간
    @Value("${jwt.refresh-token-expiration-time}")
    private long REFRESH_TOKEN_EXPIRE_TIME;// 7일
    private static int REFRESH_TOKEN_EXPIRE_TIME_COOKIE;

    private final SecretKey key;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public Long extractIdFromToken(String Token) {
        return Long.parseLong(parseClaims(Token).getSubject());
    }

    public TokenInfo generateToken(Long id, String role) {
        long now = (new Date()).getTime();
        String accessToken = Jwts.builder()
                .subject(String.valueOf(id))
                .claim(AUTHORITIES_KEY, role)
                .expiration(new Date(now + ACCESS_TOKEN_EXPIRE_TIME))
                .issuedAt(new Date(now))
                .signWith(key)
                .compact();

        String refreshToken = Jwts.builder()
                .subject(String.valueOf(id))
                .expiration(new Date(now + REFRESH_TOKEN_EXPIRE_TIME))
                .signWith(key)
                .compact();

        log.info("REFRESH_TOKEN_EXPIRE_TIME = {}", REFRESH_TOKEN_EXPIRE_TIME);
        return TokenInfo.builder()
                .grantType(BEARER_TYPE)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .refreshTokenExpirationTime(REFRESH_TOKEN_EXPIRE_TIME)
                .build();
    }

    public Authentication getAuthentication(String accessToken) {
        Claims claims = parseClaims(accessToken);

        if (claims.get(AUTHORITIES_KEY) == null) {
            throw new RuntimeException("권한 정보가 없는 토큰입니다.");
        }

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .toList();

        UserDetails principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT Token", e);
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }

    private Claims parseClaims(String accessToken) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(accessToken)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    public Long getExpiration(String accessToken) {
        Date expiration = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(accessToken)
                .getPayload()
                .getExpiration();
        long now = new Date().getTime();
        return (expiration.getTime() - now);
    }

    @Value("${jwt.refresh-token-expiration-time-cookie}")
    public void setRefreshTokenExpireTimeCookie(int expireTime) {
        REFRESH_TOKEN_EXPIRE_TIME_COOKIE = expireTime;
    }

    public static int getRefreshTokenExpireTimeCookie() {
        return REFRESH_TOKEN_EXPIRE_TIME_COOKIE;
    }
}

