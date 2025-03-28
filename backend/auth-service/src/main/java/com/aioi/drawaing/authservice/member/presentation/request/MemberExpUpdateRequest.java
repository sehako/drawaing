package com.aioi.drawaing.authservice.member.presentation.request;

public record MemberExpUpdateRequest(
        Long memberId,
        Integer exp,
        Integer point
) {
}
