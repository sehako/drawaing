package com.aioi.drawaing.auth.oauth.domain.info;

import com.aioi.drawaing.auth.oauth.domain.entity.ProviderType;
import com.aioi.drawaing.auth.oauth.domain.info.impl.GoogleOAuth2UserInfo;
import com.aioi.drawaing.auth.oauth.domain.info.impl.KakaoOAuth2UserInfo;
import com.aioi.drawaing.auth.oauth.domain.info.impl.NaverOAuth2UserInfo;
import java.util.Map;

public class OAuth2UserInfoFactory {
    public static OAuth2UserInfo getOAuth2UserInfo(ProviderType providerType, Map<String, Object> attributes) {
        return switch (providerType) {
            case GOOGLE -> new GoogleOAuth2UserInfo(attributes);
            case NAVER -> new NaverOAuth2UserInfo(attributes);
            case KAKAO -> new KakaoOAuth2UserInfo(attributes);
            default -> throw new IllegalArgumentException("Invalid Provider Type.");
        };
    }
}
