package com.aioi.drawaing.authservice.ranking.application;

import com.aioi.drawaing.authservice.common.response.PageResponse;
import com.aioi.drawaing.authservice.member.application.MemberService;
import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.domain.GameStatus;
import com.aioi.drawaing.authservice.ranking.domain.RankingType;
import com.aioi.drawaing.authservice.ranking.infrastructure.repository.DrawingGameRecordRepository;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import com.aioi.drawaing.authservice.ranking.presentation.response.GameRecordResponse;
import com.aioi.drawaing.authservice.ranking.presentation.response.PersonalRankingResponse;
import com.aioi.drawaing.authservice.ranking.presentation.response.RankingResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankingService {

    private final DrawingGameRecordRepository drawingGameRecordRepository;
    private final MemberService memberService;

    @Transactional
    public List<GameRecordResponse> updateGameRecords(List<GameResultRequest> requests) {
        List<GameRecordResponse> responses = new ArrayList<>();

        for (GameResultRequest req : requests) {
            DrawingGameRecord record = getOrCreateRecord(req.memberId());
            GameStatus status = parseGameStatus(req.status());
            record.updateRecord(req.score());

            switch (status) {
                case WIN -> record.updateWinCount();
                case DRAW -> record.updateDrawCount();
                case LOSE -> record.updateLoseCount();
                default -> throw new IllegalArgumentException("Invalid game status");
            }
            log.info("Game record updated: win={}, draw={}, lose={}, rankScore={}, playCount={}",
                    record.getWin(), record.getDraw(), record.getLose(), record.getRankScore(), record.getPlayCount());
            responses.add(GameRecordResponse.from(drawingGameRecordRepository.save(record)));
        }

        return responses;
    }

    public PageResponse<?> getDrawingGameRanking(String rankingType, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);

        RankingType type = parseRankingType(rankingType);
        Page<RankingResponse> resultPage = getRankingData(type, pageRequest);
        log.info("{} Type ranking totalElements: {}", type, resultPage.getTotalElements());
        return PageResponse.from(resultPage);
    }

    public GameRecordResponse getDrawingGameRecordByMemberId(Long memberId) {
        DrawingGameRecord record = getOrCreateRecord(memberId);
        return GameRecordResponse.from(drawingGameRecordRepository.save(record));
    }

    private DrawingGameRecord getOrCreateRecord(Long memberId) {
        Member member = memberService.getMember(memberId);
        return drawingGameRecordRepository.findByMemberId(memberId)
                .orElseGet(() -> DrawingGameRecord.builder()
                        .member(member)
                        .playCount(0)
                        .achievedAt(LocalDateTime.now())
                        .win(0)
                        .draw(0)
                        .lose(0)
                        .rankScore(0)
                        .lastPlayedAt(LocalDateTime.now())
                        .build());
    }

    public PersonalRankingResponse getRankingByMemberId(String rankingType, Long memberId) {
        RankingType type = parseRankingType(rankingType);
        PersonalRankingResponse rank = getRankByType(type, memberId);
        log.info("{} Rank By MemberId={} : {}", type, memberId, rank);
        if (rank == null) {
            throw new IllegalArgumentException("rank is null");
        }
        return rank;
    }

    private PersonalRankingResponse getRankByType(RankingType type, Long memberId) {
        switch (type) {
            case SCORE:
                return drawingGameRecordRepository.findScoreRankByMemberId(memberId);
            case PLAY:
                return drawingGameRecordRepository.findPlayCountRankByMemberId(memberId);
            case POINT:
                return drawingGameRecordRepository.findPointRankByMemberId(memberId);
            case LEVEL:
                return drawingGameRecordRepository.findLevelRankByMemberId(memberId);
            default:
                log.error("처리할 수 없는 랭킹 타입: {}", type);
                throw new IllegalArgumentException("처리할 수 없는 랭킹 타입: " + type);
        }
    }

    private Page<RankingResponse> getRankingData(RankingType type, PageRequest pageRequest) {
        switch (type) {
            case SCORE:
                return drawingGameRecordRepository.findRankingByScore(pageRequest);
            case PLAY:
                return drawingGameRecordRepository.findRankingByPlayCount(pageRequest);
            case POINT:
                return drawingGameRecordRepository.findRankingByPoint(pageRequest);
            case LEVEL:
                return drawingGameRecordRepository.findRankingByLevel(pageRequest);
            default:
                log.error("처리할 수 없는 랭킹 타입: {}", type);
                throw new IllegalArgumentException("처리할 수 없는 랭킹 타입: " + type);
        }
    }

    private RankingType parseRankingType(String rankingType) {
        try {
            return RankingType.valueOf(rankingType.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("유효하지 않은 랭킹 타입: {}", rankingType);
            throw new IllegalArgumentException("유효하지 않은 랭킹 타입: " + rankingType);
        }
    }

    private GameStatus parseGameStatus(String gameStatus) {
        try {
            return GameStatus.valueOf(gameStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("유효하지 않은 결과 타입: {}", gameStatus);
            throw new IllegalArgumentException("유효하지 않은 결과 타입: " + gameStatus);
        }
    }

}
