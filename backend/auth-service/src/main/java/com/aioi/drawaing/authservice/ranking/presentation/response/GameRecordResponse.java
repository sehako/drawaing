package com.aioi.drawaing.authservice.ranking.presentation.response;

import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record GameRecordResponse(
        int maximumScore,
        LocalDateTime achievedAt,
        int rankScore,
        int playCount,
        int win,
        int draw,
        int lose,
        LocalDateTime lastPlayedAt
) {
    public static GameRecordResponse from(DrawingGameRecord record) {
        return builder()
                .maximumScore(record.getMaximumScore())
                .achievedAt(record.getAchievedAt())
                .rankScore(record.getRankScore())
                .playCount(record.getPlayCount())
                .win(record.getWin())
                .draw(record.getDraw())
                .lose(record.getLose())
                .lastPlayedAt(record.getLastPlayedAt())
                .build();
    }
}
