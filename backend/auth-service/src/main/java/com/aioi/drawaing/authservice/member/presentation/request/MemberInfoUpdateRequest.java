package com.aioi.drawaing.authservice.member.presentation.request;

public record MemberInfoUpdateRequest(
        String nickname,
        String characterImageUrl,
        String password
) {
}
