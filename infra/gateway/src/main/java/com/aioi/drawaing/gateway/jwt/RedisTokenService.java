package com.aioi.drawaing.gateway.jwt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisTokenService {
    private final RedisTemplate<String, String> redisTemplate;

    // 토큰 조회
    public String getToken(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}