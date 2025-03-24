package com.aioi.drawaing.authservice.member.presentation.response;

import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import lombok.Builder;

@Builder
public record MemberResponse(
        Long memberId,
        String nickname,
        String email,
        String characterImage,
        ProviderType providerType,
        Integer level,
        Integer exp,
        Integer point
) {
    public static MemberResponse of(Member member) {
        return MemberResponse.builder()
                .memberId(member.getId())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .characterImage(member.getCharacterImage())
                .providerType(member.getProviderType())
                .level(member.getLevel())
                .exp(member.getExp())
                .point(member.getPoint())
                .build();
    }
}

