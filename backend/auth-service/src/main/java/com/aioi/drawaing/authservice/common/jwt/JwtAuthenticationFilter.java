package com.aioi.drawaing.authservice.common.jwt;

import com.aioi.drawaing.authservice.common.util.HeaderUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.GenericFilterBean;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends GenericFilterBean {

    private final com.aioi.drawaing.authservice.common.jwt.JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // 1. Request Header 에서 Access Token 추출
        String token = HeaderUtil.getAccessToken((HttpServletRequest) request);

        // 2. Access Token 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // (추가) Redis 에 해당 Refresh Token 여부 확인
            String isLogout = redisTemplate.opsForValue().get(token);
            if (ObjectUtils.isEmpty(isLogout)) {
                // 토큰이 유효할 경우 토큰에서 Authentication 객체를 가지고 와서 SecurityContext 에 저장
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        chain.doFilter(request, response);
    }
}
