package com.aioi.drawaing.authservice.member.application.response;

import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import lombok.Builder;

@Builder
public record MemberLoginResponse(
        long memberId,
        String nickname,
        String email,
        String profileImg,
        ProviderType providerType,
        String AccessToken
) {
    public static MemberLoginResponse of(Member member, String accessToken) {
        return MemberLoginResponse.builder()
                .memberId(member.getId())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .profileImg(member.getProfileImg())
                .providerType(member.getProviderType())
                .AccessToken(accessToken)
                .build();
    }
}
