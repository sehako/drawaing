package com.aioi.drawaing.authservice.ranking.infrastructure.repository;

import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.presentation.response.RankingResponse;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DrawingGameRecordRepository extends JpaRepository<DrawingGameRecord, Long> {

    Optional<DrawingGameRecord> findByMemberId(Long memberId);

    @Query(value = """
                WITH RankedScores AS (
                    SELECT 
                        m.member_id AS memberId,
                        RANK() OVER (ORDER BY dgr.maximum_score DESC, dgr.achieved_at ASC) AS `rank`
                    FROM 
                        drawing_game_record dgr
                    JOIN 
                        member m ON dgr.member_id = m.member_id
                    WHERE 
                        m.role != 'ROLE_GUEST'
                )
                SELECT `rank`
                FROM RankedScores 
                WHERE memberId= :memberId;
            """, nativeQuery = true)
    Integer findScoreRankByMemberId(@Param("memberId") Long memberId);

    @Query(value = """
                WITH PlayCountRanking AS (
                    SELECT 
                        m.member_id AS memberId,
                        RANK() OVER (ORDER BY dgr.play_count DESC, dgr.last_played_at ASC) AS `rank`
                    FROM drawing_game_record dgr
                    JOIN member m ON dgr.member_id = m.member_id
                    WHERE m.role != 'ROLE_GUEST'
                )
                SELECT `rank`
                FROM PlayCountRanking 
                WHERE memberId = :memberId
            """, nativeQuery = true)
    Integer findPlayCountRankByMemberId(@Param("memberId") Long memberId);

    @Query(value = """
                WITH PointRanking AS (
                    SELECT 
                        m.member_id AS memberId,
                        RANK() OVER (ORDER BY m.point DESC, dgr.last_played_at ASC) AS `rank`
                    FROM drawing_game_record dgr
                    JOIN member m ON dgr.member_id = m.member_id
                    WHERE m.role != 'ROLE_GUEST'
                )
                SELECT `rank`
                FROM PointRanking 
                WHERE memberId = :memberId
            """, nativeQuery = true)
    Integer findPointRankByMemberId(@Param("memberId") Long memberId);

    @Query(value = """
                WITH LevelRanking AS (
                    SELECT 
                        m.member_id AS memberId,
                        RANK() OVER (
                            ORDER BY 
                                m.level DESC, 
                                m.exp DESC, 
                                dgr.last_played_at ASC
                        ) AS `rank`
                    FROM drawing_game_record dgr
                    JOIN member m ON dgr.member_id = m.member_id
                    WHERE m.role != 'ROLE_GUEST'
                )
                SELECT `rank`
                FROM LevelRanking 
                WHERE memberId = :memberId
            """, nativeQuery = true)
    Integer findLevelRankByMemberId(@Param("memberId") Long memberId);

    // 랭킹 점수 랭킹 조회
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
    Page<RankingResponse> findRankingByScore(Pageable pageable);

    // 플레이 횟수 랭킹 조회
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
    Page<RankingResponse> findRankingByPlayCount(Pageable pageable);

    // 포인트 랭킹 조회
    @Query("""
                SELECT
                    m.id as memberId,
                    m.nickname as nickname,
                    m.point as value,
                    dgr.lastPlayedAt as lastPlayedAt
                FROM DrawingGameRecord dgr
                JOIN dgr.member m
                WHERE m.role != 'ROLE_GUEST'
                ORDER BY m.point DESC, dgr.lastPlayedAt ASC
            """)
    Page<RankingResponse> findRankingByPoint(Pageable pageable);

    // 레벨 랭킹 조회
    @Query("""
                SELECT
                    m.id as memberId,
                    m.nickname as nickname,
                    m.level as value,
                    dgr.lastPlayedAt as lastPlayedAt
                FROM DrawingGameRecord dgr
                JOIN dgr.member m
                WHERE m.role != 'ROLE_GUEST'
                ORDER BY m.level DESC, m.exp DESC, dgr.lastPlayedAt ASC
            """)
    Page<RankingResponse> findRankingByLevel(Pageable pageable);
}