package com.aioi.drawaing.authservice.member.presentation.request;

public record MemberRequest(
        String nickname,
        String password
) {
}
