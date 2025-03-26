package com.aioi.drawaing.authservice.member.presentation.request;

public record MemberUpdateRequest(
        String nickname,
        String characterImageUrl,
        String password
) {
}
