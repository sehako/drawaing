package com.aioi.drawaing.authservice.ranking.presentation;

import com.aioi.drawaing.authservice.common.response.ApiResponseEntity;
import com.aioi.drawaing.authservice.ranking.application.RankingService;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

    @PatchMapping()
    public ResponseEntity<?> updateRecord(
            HttpServletRequest request,
            @RequestBody GameResultRequest gameResultRequest) {
        Long memberId = Long.parseLong(request.getParameter("member-id"));
        return ApiResponseEntity.onSuccess(
                rankingService.updateGameRecord(memberId, gameResultRequest.status(), gameResultRequest.score())
        );
    }
}
