package com.aioi.drawaing.authservice.ranking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DrawingGameRecord {

    @Id
    @Column(name = "drawing_game_record_id")
    private Long id;

    @Column(name = "maximum_score", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int maximumScore;

    @Column(name = "achieved_at", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime achievedAt;

    @Column(name = "rank_score", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int rankScore;

    @Column(name = "play_count", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int playCount;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private int win;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private int draw;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private int lose;

    @Column(name = "last_played_at", nullable = false,
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime lastPlayedAt;

    public void updatePlayCount() {
        this.playCount++;
    }

    public void updateWinCount() {
        this.win++;
    }

    public void updateLoseCount() {
        this.lose++;
    }

    public void updateDrawCount() {
        this.draw++;
    }

    public void addRankScore(Integer score) {
        this.rankScore += score;
    }

    public void updateMaximumScore(Integer score) {
        this.maximumScore = score;
    }

    public void updateAchievedAt() {
        this.achievedAt = LocalDateTime.now();
    }

    public void updateLastPlayedAt() {
        this.lastPlayedAt = LocalDateTime.now();
    }
}

