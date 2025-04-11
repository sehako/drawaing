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
    public static MemberResponse from(Member member) {
        return MemberResponse.builder()
                .memberId(member.getId())
                .nickname(removeTrailingNumbers(member.getNickname()))
                .email(member.getEmail())
                .characterImage(member.getCharacterImage())
                .providerType(member.getProviderType())
                .level(member.getLevel())
                .exp(member.getExp())
                .point(member.getPoint())
                .build();
    }

    private static String removeTrailingNumbers(String input) {
        // 정규식: 끝부분의 숫자를 제거
        return input.replaceAll("\\d+$", "");
    }
}

