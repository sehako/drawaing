package com.aioi.drawaing.authservice.ranking.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aioi.drawaing.authservice.member.application.MemberService;
import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.infrastructure.repository.DrawingGameRecordRepository;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import com.aioi.drawaing.authservice.ranking.presentation.response.GameRecordResponse;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RankingServiceTest {

    @Mock
    private DrawingGameRecordRepository recordRepository;

    @Mock
    private MemberService memberService;

    @InjectMocks
    private RankingService rankingService;

    @DisplayName("성공: 여러 게임 결과 업데이트")
    @Test
    void updateGameRecords_MultipleRequests_Success() {
        // given
        Long memberId1 = 1L;
        Long memberId2 = 2L;

        Member mockMember1 = Member.builder().id(memberId1).build();
        Member mockMember2 = Member.builder().id(memberId2).build();

        List<GameResultRequest> requests = List.of(
                new GameResultRequest(memberId1, "WIN", 20),
                new GameResultRequest(memberId2, "DRAW", 10)
        );

        DrawingGameRecord existingRecord1 = DrawingGameRecord.builder()
                .member(mockMember1)
                .playCount(0)
                .win(0)
                .draw(0)
                .lose(0)
                .rankScore(0)
                .build();

        DrawingGameRecord existingRecord2 = DrawingGameRecord.builder()
                .member(mockMember2)
                .playCount(5)
                .win(2)
                .draw(1)
                .lose(2)
                .rankScore(200)
                .maximumScore(200)
                .build();

        when(recordRepository.findById(memberId1)).thenReturn(Optional.of(existingRecord1));
        when(recordRepository.findById(memberId2)).thenReturn(Optional.of(existingRecord2));
        when(recordRepository.save(any(DrawingGameRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        List<GameRecordResponse> results = rankingService.updateGameRecords(requests);

        // then
        assertNotNull(results);
        assertEquals(2, results.size());

        GameRecordResponse result1 = results.get(0);
        assertEquals(1, result1.playCount());
        assertEquals(1, result1.win());
        assertEquals(0, result1.draw());
        assertEquals(0, result1.lose());
        assertEquals(20, result1.rankScore());
        assertEquals(20, result1.maximumScore());

        GameRecordResponse result2 = results.get(1);
        assertEquals(6, result2.playCount());
        assertEquals(2, result2.win());
        assertEquals(2, result2.draw());
        assertEquals(2, result2.lose());
        assertEquals(210, result2.rankScore());
        assertEquals(210, result2.maximumScore());

        // verify
        verify(recordRepository, times(1)).findById(memberId1);
        verify(recordRepository, times(1)).findById(memberId2);
        verify(recordRepository, times(2)).save(any(DrawingGameRecord.class));
    }

    @DisplayName("실패: Status null 에러")
    @Test
    void updateGameRecords_InvalidGameStatus() {
        // given
        Long memberId = 1L;

        List<GameResultRequest> requests = List.of(
                new GameResultRequest(memberId, null, 100) // Invalid status
        );

        // when & then
        assertThrows(
                NullPointerException.class,
                () -> rankingService.updateGameRecords(requests)
        );
    }
}


