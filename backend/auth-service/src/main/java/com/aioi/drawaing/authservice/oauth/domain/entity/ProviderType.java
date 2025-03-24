package com.aioi.drawaing.authservice.oauth.domain.entity;

import lombok.Getter;

@Getter
public enum ProviderType {
    GUEST,
    LOCAL,
    GOOGLE,
    NAVER,
    KAKAO
}
