package com.aioi.drawaing.authservice.ranking.presentation;

import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.ranking.application.RankingService;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ranking")
@Tag(name = "랭킹", description = "랭킹 API")
public class RankingController {
    private final RankingService rankingService;

    public enum GameStatus {WIN, LOSE, DRAW}

    @Operation(summary = "게임 결과 업데이트")
    @PatchMapping()
    public ResponseEntity<?> updateRecord(
            @RequestBody GameResultRequest gameResultRequest) {
        return ApiResponseEntity.onSuccess(
                rankingService.updateGameRecord(gameResultRequest)
        );
    }
}
