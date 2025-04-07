package com.aioi.drawaing.authservice.member.application.response;

import com.aioi.drawaing.authservice.member.presentation.response.MemberResponse;
import lombok.Builder;

@Builder
public record MemberLoginResponse(
        MemberResponse memberResponse,
        String AccessToken
) {
    public static MemberLoginResponse of(MemberResponse memberResponse, String accessToken) {
        return MemberLoginResponse.builder()
                .memberResponse(memberResponse)
                .AccessToken(accessToken)
                .build();
    }
}
