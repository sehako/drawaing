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
import com.aioi.drawaing.authservice.ranking.presentation.RankingController.GameStatus;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import com.aioi.drawaing.authservice.ranking.presentation.response.GameRecordResponse;
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

    @DisplayName("성공: 승리 결과 업데이트")
    @Test
    void updateGameRecord_NewRecord_Win() {
        // given
        Long memberId = 1L;
        Member mockMember = Member.builder()
                .id(memberId)
                .build();
        GameResultRequest request = new GameResultRequest(memberId, GameStatus.WIN, 20);
        DrawingGameRecord existingRecord = DrawingGameRecord.builder()
                .member(mockMember)
                .playCount(0)
                .win(0)
                .draw(0)
                .lose(0)
                .rankScore(0)
                .build();

        when(recordRepository.findById(memberId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any((DrawingGameRecord.class)))).thenReturn(existingRecord);

        // when
        GameRecordResponse result = rankingService.updateGameRecord(request);

        // then
        assertNotNull(result);
        assertEquals(1, result.playCount());
        assertEquals(1, result.win());
        assertEquals(0, result.draw());
        assertEquals(0, result.lose());
        assertEquals(20, result.rankScore());
        assertEquals(20, result.maximumScore());

        // verify
        verify(recordRepository, times(1)).findById(memberId);
        verify(recordRepository, times(1)).save(any(DrawingGameRecord.class));
    }

    @DisplayName("성공: 무승부 결과 업데이트")
    @Test
    void updateGameRecord_ExistingRecord_Draw() {
        // given
        Long memberId = 1L;
        Member mockMember = Member.builder()
                .id(memberId)
                .build();
        GameResultRequest request = new GameResultRequest(memberId, GameStatus.DRAW, 10);
        DrawingGameRecord existingRecord = DrawingGameRecord.builder()
                .member(mockMember)
                .playCount(5)
                .win(2)
                .draw(1)
                .lose(2)
                .rankScore(200)
                .maximumScore(200)
                .build();

        when(recordRepository.findById(memberId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any(DrawingGameRecord.class))).thenReturn(existingRecord);

        // when
        GameRecordResponse result = rankingService.updateGameRecord(request);

        // then
        assertNotNull(result);
        assertEquals(6, result.playCount());
        assertEquals(2, result.win());
        assertEquals(2, result.draw());
        assertEquals(2, result.lose());
        assertEquals(210, result.rankScore());
        assertEquals(210, result.maximumScore());

        // verify
        verify(recordRepository, times(1)).findById(memberId);
        verify(recordRepository, times(1)).save(any(DrawingGameRecord.class));
    }

    @DisplayName("성공: 패배 결과 업데이트")
    @Test
    void updateGameRecord_ExistingRecord_Lose() {
        // given
        Long memberId = 1L;
        Member mockMember = Member.builder()
                .id(memberId)
                .build();
        GameResultRequest request = new GameResultRequest(memberId, GameStatus.LOSE, -10);
        DrawingGameRecord existingRecord = DrawingGameRecord.builder()
                .member(mockMember)
                .playCount(10)
                .win(5)
                .draw(3)
                .lose(2)
                .rankScore(500)
                .maximumScore(530)
                .build();

        when(recordRepository.findById(memberId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any(DrawingGameRecord.class))).thenReturn(existingRecord);

        // when
        GameRecordResponse result = rankingService.updateGameRecord(request);

        // then
        assertNotNull(result);
        assertEquals(11, result.playCount());
        assertEquals(5, result.win());
        assertEquals(3, result.draw());
        assertEquals(3, result.lose());
        assertEquals(490, result.rankScore());
        assertEquals(530, result.maximumScore());

        // verify
        verify(recordRepository, times(1)).findById(memberId);
        verify(recordRepository, times(1)).save(any(DrawingGameRecord.class));
    }

    @DisplayName("실패: Status null 에러")
    @Test
    void updateGameRecord_InvalidGameStatus() {
        // given
        Long memberId = 1L;
        GameResultRequest request = new GameResultRequest(memberId, null, 100);

        // when & then
        assertThrows(NullPointerException.class, () -> rankingService.updateGameRecord(request));
    }
}

