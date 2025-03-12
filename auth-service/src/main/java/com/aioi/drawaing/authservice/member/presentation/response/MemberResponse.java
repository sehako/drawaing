package com.aioi.drawaing.authservice.member.presentation.response;

import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import lombok.Builder;

@Builder
public record MemberResponse(
        long memberId,
        String nickname,
        String email,
        String profileImg,
        ProviderType providerType
) {
}

