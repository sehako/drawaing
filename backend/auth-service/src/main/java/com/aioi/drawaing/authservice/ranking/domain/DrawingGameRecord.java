package com.aioi.drawaing.authservice.ranking.domain;

import com.aioi.drawaing.authservice.member.domain.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DrawingGameRecord {
    @Id
    @Column(name = "member_id")
    private Long memberId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "maximum_score")
    private Integer maximumScore;

    @Column(name = "achieved_at")
    private LocalDateTime achievedAt;

    @Column(name = "rank_score")
    private Integer rankScore;

    @Column(name = "play_count")
    private Integer playCount;

    @Column(name = "win")
    private Integer win;

    @Column(name = "draw")
    private Integer draw;

    @Column(name = "lose")
    private Integer lose;

    @Column(name = "last_played_at")
    private LocalDateTime lastPlayedAt;
}

