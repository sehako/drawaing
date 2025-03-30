package com.aioi.drawaing.authservice.member.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.member.exception.MemberException;
import com.aioi.drawaing.authservice.member.infrastructure.repository.MemberRepository;
import com.aioi.drawaing.authservice.member.presentation.request.MemberExpUpdateRequest;
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

    @DisplayName("성공: 경험치 업데이트")
    @Test
    void expUpdate_Success() {
        // given
        Long memberId = 1L;
        Member existingMember = Member.builder()
                .id(memberId)
                .level(1)
                .exp(0)
                .point(50)
                .build();
        MemberExpUpdateRequest request = new MemberExpUpdateRequest(memberId, 20, 30);

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(existingMember));

        // when
        memberService.expUpdate(request);

        //then
        assertEquals(1, existingMember.getId());
        assertEquals(2, existingMember.getLevel());
        assertEquals(5, existingMember.getExp());
        assertEquals(80, existingMember.getPoint());

        // verify
        verify(memberRepository, times(1)).findById(memberId);
    }

    @DisplayName("실패: 멤버 조회 에러")
    @Test
    void expUpdate_MemberNotFound() {
        // given
        Long memberId = 1000000L;
        MemberExpUpdateRequest request = new MemberExpUpdateRequest(memberId, 200, 30);

        when(memberRepository.findById(memberId)).thenReturn(Optional.empty());

        // when & then
        assertThrows(MemberException.class, () -> memberService.expUpdate(request));
        verify(memberRepository, times(1)).findById(memberId);
    }
}