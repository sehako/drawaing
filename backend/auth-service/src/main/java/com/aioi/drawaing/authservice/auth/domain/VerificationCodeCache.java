package com.aioi.drawaing.authservice.auth.domain;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@Builder
@AllArgsConstructor
@RedisHash(value = "verificationCode", timeToLive = 600)
public class VerificationCodeCache implements Serializable {
    @Id
    private String email;

    private String code;

    private Boolean verified;

    private LocalDateTime createdAt;

    public void verify() {
        this.verified = true;
    }
}
