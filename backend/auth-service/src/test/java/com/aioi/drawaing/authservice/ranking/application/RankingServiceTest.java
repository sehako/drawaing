package com.aioi.drawaing.authservice.ranking.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.infrastructure.repository.DrawingGameRecordRepository;
import com.aioi.drawaing.authservice.ranking.presentation.RankingController.GameStatus;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
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

    @InjectMocks
    private RankingService rankingService;

    @DisplayName("승리 결과 저장")
    @Test
    void updateGameRecord_NewRecord_Win() {
        //given
        Long memberId = 1L;
        GameResultRequest request = new GameResultRequest(memberId, GameStatus.WIN, 20);
        DrawingGameRecord existingRecord = DrawingGameRecord.builder()
                .id(memberId)
                .playCount(0)
                .win(0)
                .draw(0)
                .lose(0)
                .rankScore(0)
                .build();

        //when
        when(recordRepository.findById(memberId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any((DrawingGameRecord.class)))).thenReturn(existingRecord);

        //then
        DrawingGameRecord result = rankingService.updateGameRecord(request);

        assertNotNull(result);
        assertEquals(1, result.getPlayCount());
        assertEquals(1, result.getWin());
        assertEquals(0, result.getDraw());
        assertEquals(0, result.getLose());
        assertEquals(20, result.getRankScore());
        assertEquals(20, result.getMaximumScore());

        verify(recordRepository, times(1)).findById(memberId);
        verify(recordRepository, times(1)).save(any(DrawingGameRecord.class));
    }

    @DisplayName("무승부 결과 저장")
    @Test
    void updateGameRecord_ExistingRecord_Draw() {
        //given
        Long memberId = 1L;
        GameResultRequest request = new GameResultRequest(memberId, GameStatus.DRAW, 10);
        DrawingGameRecord existingRecord = DrawingGameRecord.builder()
                .id(memberId)
                .playCount(5)
                .win(2)
                .draw(1)
                .lose(2)
                .rankScore(200)
                .maximumScore(200)
                .build();

        //when
        when(recordRepository.findById(memberId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any(DrawingGameRecord.class))).thenReturn(existingRecord);

        //then
        DrawingGameRecord result = rankingService.updateGameRecord(request);

        assertNotNull(result);
        assertEquals(6, result.getPlayCount());
        assertEquals(2, result.getWin());
        assertEquals(2, result.getDraw());
        assertEquals(2, result.getLose());
        assertEquals(210, result.getRankScore());
        assertEquals(210, result.getMaximumScore());

        verify(recordRepository).findById(memberId);
        verify(recordRepository).save(any(DrawingGameRecord.class));
    }

    @DisplayName("패배 결과 저장")
    @Test
    void updateGameRecord_ExistingRecord_Lose() {
        //given
        Long memberId = 1L;
        GameResultRequest request = new GameResultRequest(memberId, GameStatus.LOSE, -10);
        DrawingGameRecord existingRecord = DrawingGameRecord.builder()
                .id(memberId)
                .playCount(10)
                .win(5)
                .draw(3)
                .lose(2)
                .rankScore(500)
                .maximumScore(530)
                .build();

        //when
        when(recordRepository.findById(memberId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any(DrawingGameRecord.class))).thenReturn(existingRecord);

        //then
        DrawingGameRecord result = rankingService.updateGameRecord(request);

        assertNotNull(result);
        assertEquals(11, result.getPlayCount());
        assertEquals(5, result.getWin());
        assertEquals(3, result.getDraw());
        assertEquals(3, result.getLose());
        assertEquals(490, result.getRankScore());
        assertEquals(530, result.getMaximumScore());

        verify(recordRepository).findById(memberId);
        verify(recordRepository).save(any(DrawingGameRecord.class));
    }

    @DisplayName("Status 가 null 인 경우")
    @Test
    void updateGameRecord_InvalidGameStatus() {
        //given
        Long memberId = 1L;
        GameResultRequest request = new GameResultRequest(memberId, null, 100);
        //when
        //then
        assertThrows(NullPointerException.class, () -> rankingService.updateGameRecord(request));
    }
}

