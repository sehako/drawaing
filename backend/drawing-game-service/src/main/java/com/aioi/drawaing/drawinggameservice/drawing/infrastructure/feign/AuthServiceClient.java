package com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign;

import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.request.GameResultRequest;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.request.MemberExpUpdateRequest;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.feign.response.AuthResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @PatchMapping("/api/v1/ranking")
    AuthResponse updateRanking(@RequestBody GameResultRequest gameResultRequest);
    @PatchMapping("/api/v1/member/exp")
    AuthResponse updateMemberExp(@RequestBody MemberExpUpdateRequest memberExpUpdateRequest);
}
