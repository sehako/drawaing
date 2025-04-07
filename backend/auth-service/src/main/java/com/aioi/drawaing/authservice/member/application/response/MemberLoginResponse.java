package com.aioi.drawaing.authservice.member.application.response;

import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import lombok.Builder;

@Builder
public record MemberLoginResponse(
        Long memberId,
        String nickname,
        String email,
        String characterImage,
        ProviderType providerType,
        Integer level,
        Integer exp,
        Integer point,
        String AccessToken
) {
    public static MemberLoginResponse of(Member member, String accessToken) {
        return MemberLoginResponse.builder()
                .memberId(member.getId())
                .nickname(removeTrailingNumbers(member.getNickname()))
                .email(member.getEmail())
                .characterImage(member.getCharacterImage())
                .providerType(member.getProviderType())
                .level(member.getLevel())
                .exp(member.getExp())
                .point(member.getPoint())
                .AccessToken(accessToken)
                .build();
    }

    private static String removeTrailingNumbers(String input) {
        // 정규식: 끝부분의 숫자를 제거
        return input.replaceAll("\\d+$", "");
    }
}
