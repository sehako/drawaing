package com.aioi.drawaing.authservice.ranking.application;

import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.infrastructure.repository.DrawingGameRecordRepository;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final DrawingGameRecordRepository recordRepository;

    @Transactional
    public DrawingGameRecord updateGameRecord(GameResultRequest req) {

        DrawingGameRecord record = getOrCreateRecord(req.memberId());

        record.updateRecord(req.score());

        switch (req.status()) {
            case WIN -> record.updateWinCount();
            case DRAW -> record.updateDrawCount();
            case LOSE -> record.updateLoseCount();
            default -> throw new IllegalArgumentException("Invalid game status");
        }

        return recordRepository.save(record);
    }

    private DrawingGameRecord getOrCreateRecord(Long memberId) {
        return recordRepository.findById(memberId)
                .orElseGet(() -> DrawingGameRecord.builder()
                        .id(memberId)
                        .playCount(0)
                        .win(0)
                        .draw(0)
                        .lose(0)
                        .rankScore(0)
                        .build());
    }
}
