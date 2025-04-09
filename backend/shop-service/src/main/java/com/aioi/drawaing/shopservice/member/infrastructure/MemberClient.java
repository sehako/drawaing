package com.aioi.drawaing.shopservice.member.infrastructure;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// FeignClient 인터페이스 정의
@FeignClient(name = "member-service", url = "${member.service.url}")
public interface MemberClient {
    @GetMapping("api/v1/member/{memberId}/point")
    int getPoint(@PathVariable Long memberId);
}
