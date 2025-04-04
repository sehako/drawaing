package com.aioi.drawaing.authservice.ranking.presentation;

import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.ranking.application.RankingService;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ranking")
@Tag(name = "랭킹", description = "랭킹 API")
public class RankingController {
    private final RankingService rankingService;

    @Operation(summary = "랭킹 점수 업데이트")
    @PatchMapping()
    public ResponseEntity<?> updateRecord(
            @RequestBody List<GameResultRequest> gameResultRequest) {
        rankingService.updateGameRecords(gameResultRequest);
        log.info("랭킹 점수 업데이트 완료");
        return ApiResponseEntity.onSuccess("랭킹 점수 업데이트 완료");
    }

    @Operation(summary = "카테고리별 개인 순위 조회")
    @GetMapping("/{member_id}")
    public ResponseEntity<?> getRanking(
            @PathVariable("member_id") Long memberId,
            @RequestParam(name = "type") String rankingType) {
        log.info("===== 카테고리별 개인 순위 조회 =====");
        return ApiResponseEntity.onSuccess(
                rankingService.getRankingByMemberId(rankingType, memberId)
        );
    }

    @Operation(summary = "개인 게임 기록 조회")
    @GetMapping("/score/{member_id}")
    public ResponseEntity<?> getRecord(
            @PathVariable("member_id") Long memberId) {
        log.info("===== 개인 게임 기록 조회 =====");
        return ApiResponseEntity.onSuccess(
                rankingService.getDrawingGameRecordByMemberId(memberId)
        );
    }

    @Operation(summary = "카테고리별 전체 랭킹 조회")
    @GetMapping()
    public ResponseEntity<?> getCategoryRankings(
            @RequestParam(name = "type") String rankingType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("===== 카테고리별 전체 랭킹 조회 =====");
        return ApiResponseEntity.onSuccess(
                rankingService.getDrawingGameRanking(rankingType, page, size)
        );
    }
}
