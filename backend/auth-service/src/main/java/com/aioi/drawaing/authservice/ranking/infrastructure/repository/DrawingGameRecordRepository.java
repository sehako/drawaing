package com.aioi.drawaing.authservice.ranking.infrastructure.repository;

import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.presentation.response.RankingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DrawingGameRecordRepository extends JpaRepository<DrawingGameRecord, Long> {
    // 랭킹 점수 조회
    @Query("""
                SELECT
                    m.id as memberId,
                    m.nickname as nickname,
                    dgr.maximumScore as value,
                    dgr.achievedAt as lastPlayedAt
                FROM DrawingGameRecord dgr
                JOIN dgr.member m
                WHERE m.role != 'ROLE_GUEST'
                ORDER BY dgr.maximumScore DESC, dgr.achievedAt ASC
            """)
    Page<RankingResponse> findByScoreRanking(Pageable pageable);

    // 플레이 횟수 조회
    @Query("""
                SELECT 
                    m.id as memberId,
                    m.nickname as nickname,
                    dgr.playCount as value,
                    dgr.lastPlayedAt as lastPlayedAt
                FROM DrawingGameRecord dgr
                JOIN dgr.member m
                WHERE m.role != 'ROLE_GUEST'
                ORDER BY dgr.playCount DESC, dgr.lastPlayedAt ASC
            """)
    Page<RankingResponse> findByPlayCountRanking(Pageable pageable);

    // 포인트 조회
    @Query("""
                SELECT 
                    m.id as memberId,
                    m.nickname as nickname,
                    m.point as value,
                    dgr.lastPlayedAt as lastPlayedAt
                FROM DrawingGameRecord dgr
                JOIN dgr.member m
                WHERE m.role != 'ROLE_GUEST'
                ORDER BY m.point DESC, lastPlayedAt ASC
            """)
    Page<RankingResponse> findByPointRanking(Pageable pageable);

    // 레벨 조회
    @Query("""
                SELECT 
                    m.id as memberId,
                    m.nickname as nickname,
                    m.level as value,
                    dgr.lastPlayedAt as lastPlayedAt
                FROM DrawingGameRecord dgr
                JOIN dgr.member m
                WHERE m.role != 'ROLE_GUEST'
                ORDER BY m.level DESC, m.exp DESC, lastPlayedAt ASC
            """)
    Page<RankingResponse> findByLevelRanking(Pageable pageable);
}