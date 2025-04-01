package com.aioi.drawaing.authservice.member.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.member.exception.MemberException;
import com.aioi.drawaing.authservice.member.infrastructure.repository.MemberRepository;
import com.aioi.drawaing.authservice.member.presentation.request.MemberExpUpdateRequest;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private MemberService memberService;

    @DisplayName("성공: 여러 회원 경험치 업데이트")
    @Test
    void expUpdate_Success() {
        // given
        Long memberId1 = 1L;
        Long memberId2 = 2L;

        Member member1 = Member.builder()
                .id(memberId1)
                .level(1)
                .exp(0)
                .point(50)
                .build();
        Member member2 = Member.builder()
                .id(memberId2)
                .level(3)
                .exp(0)
                .point(100)
                .build();

        List<MemberExpUpdateRequest> requests = List.of(
                new MemberExpUpdateRequest(memberId1, 20, 30),
                new MemberExpUpdateRequest(memberId2, 50, 50)
        );

        when(memberRepository.findById(memberId1)).thenReturn(Optional.of(member1));
        when(memberRepository.findById(memberId2)).thenReturn(Optional.of(member2));

        // when
        memberService.expUpdate(requests);

        // then
        // 회원 1 검증
        assertEquals(2, member1.getLevel());  // 레벨 2로 증가
        assertEquals(5, member1.getExp());    // 20 exp → 5 남음 (레벨업 후 잔여 경험치)
        assertEquals(80, member1.getPoint()); // 50 + 30 = 80

        // 회원 2 검증
        assertEquals(6, member2.getLevel());  // 레벨 6으로 증가
        assertEquals(5, member2.getExp());   // 50 exp → 5 남음 (레벨업 후 잔여 경험치)
        assertEquals(150, member2.getPoint());// 100 + 50 = 150

        // verify
        verify(memberRepository, times(1)).findById(memberId1);
        verify(memberRepository, times(1)).findById(memberId2);
        verify(memberRepository, times(2)).saveAndFlush(any(Member.class)); // 2회 호출
    }

    @DisplayName("실패: 일부 멤버 조회 실패 (리스트)")
    @Test
    void expUpdate_MemberNotFound() {
        // given
        Long validMemberId = 1L;
        Long invalidMemberId = 9999L;

        Member validMember = Member.builder()
                .id(validMemberId)
                .level(1)
                .exp(0)
                .point(0)
                .build();

        // 하나는 유효, 하나는 없는 회원 ID
        List<MemberExpUpdateRequest> requests = List.of(
                new MemberExpUpdateRequest(validMemberId, 20, 30),
                new MemberExpUpdateRequest(invalidMemberId, 200, 50)
        );

        when(memberRepository.findById(validMemberId)).thenReturn(Optional.of(validMember));
        when(memberRepository.findById(invalidMemberId)).thenReturn(Optional.empty());

        // when & then
        assertThrows(MemberException.class, () -> memberService.expUpdate(requests));

        // verify
        verify(memberRepository, times(1)).findById(validMemberId);
        verify(memberRepository, times(1)).findById(invalidMemberId);
    }

}