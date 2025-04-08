package com.aioi.drawaing.shopservice.member.application;

import com.aioi.drawaing.shopservice.member.infrastructure.MemberClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberClient memberClient;

    public int getMemberPoint(Long memberId) {
        return memberClient.getPoint(memberId); // FeignClient 호출
    }
}
