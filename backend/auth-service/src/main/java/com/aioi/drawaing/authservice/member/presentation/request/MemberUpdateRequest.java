package com.aioi.drawaing.authservice.member.presentation.request;

public record MemberUpdateRequest(
        Long memberId,
        String nickname,
        String characterImageUrl,
        String password
) {
}
