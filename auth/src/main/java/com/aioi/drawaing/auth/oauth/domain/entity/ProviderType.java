package com.aioi.drawaing.auth.oauth.domain.entity;

import lombok.Getter;

@Getter
public enum ProviderType {
    GUEST,
    LOCAL,
    GOOGLE,
    NAVER,
    KAKAO
}
