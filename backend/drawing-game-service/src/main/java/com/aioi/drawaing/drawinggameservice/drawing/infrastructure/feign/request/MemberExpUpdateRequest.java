package com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.request;

public record MemberExpUpdateRequest(
        Long memberId,
        Integer exp,
        Integer point
) {
}