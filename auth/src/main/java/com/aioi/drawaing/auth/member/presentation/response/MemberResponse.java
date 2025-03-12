package com.aioi.drawaing.auth.member.presentation.response;

import com.aioi.drawaing.auth.oauth.domain.entity.ProviderType;
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

