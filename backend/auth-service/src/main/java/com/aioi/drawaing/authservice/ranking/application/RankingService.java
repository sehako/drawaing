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
import com.aioi.drawaing.authservice.ranking.presentation.response.RankingResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

            responses.add(GameRecordResponse.from(drawingGameRecordRepository.save(record)));
        }

        return responses;
    }

    private DrawingGameRecord getOrCreateRecord(Long memberId) {
        Member member = memberService.getMember(memberId);
        return drawingGameRecordRepository.findById(memberId)
                .orElseGet(() -> DrawingGameRecord.builder()
                        .member(member)
                        .playCount(0)
                        .win(0)
                        .draw(0)
                        .lose(0)
                        .rankScore(0)
                        .build());
    }

    public PageResponse<?> getDrawingGameRanking(String rankingType, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);

        RankingType type = parseRankingType(rankingType);
        Page<RankingResponse> resultPage = getRankingData(type, pageRequest);

        return PageResponse.from(resultPage);
    }

    private Page<RankingResponse> getRankingData(RankingType type, PageRequest pageRequest) {
        switch (type) {
            case SCORE:
                return drawingGameRecordRepository.findByScoreRanking(pageRequest);
            case PLAY:
                return drawingGameRecordRepository.findByPlayCountRanking(pageRequest);
            case POINT:
                return drawingGameRecordRepository.findByPointRanking(pageRequest);
            case LEVEL:
                return drawingGameRecordRepository.findByLevelRanking(pageRequest);
            default:
                throw new IllegalArgumentException("처리할 수 없는 랭킹 타입: " + type);
        }
    }

    private RankingType parseRankingType(String rankingType) {
        try {
            return RankingType.valueOf(rankingType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 랭킹 타입: " + rankingType);
        }
    }

    private GameStatus parseGameStatus(String gameStatus) {
        try {
            return GameStatus.valueOf(gameStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 결과 타입: " + gameStatus);
        }
    }
}
