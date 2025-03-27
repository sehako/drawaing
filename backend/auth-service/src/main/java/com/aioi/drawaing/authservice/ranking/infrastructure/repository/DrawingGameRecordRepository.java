package com.aioi.drawaing.authservice.ranking.infrastructure.repository;

import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DrawingGameRecordRepository extends JpaRepository<DrawingGameRecord, Long> {
    // 랭킹 점수로 정렬된 상위 N개의 기록을 가져오는 메서드
    List<DrawingGameRecord> findTop10ByOrderByRankScoreDesc();

    // 특정 멤버의 최근 게임 기록을 가져오는 메서드
    Optional<DrawingGameRecord> findFirstByIdOrderByLastPlayedAtDesc(Long memberId);

    // 특정 기간 동안 플레이한 기록이 있는 멤버들의 기록을 가져오는 메서드
    List<DrawingGameRecord> findByLastPlayedAtBetween(LocalDateTime start, LocalDateTime end);
}