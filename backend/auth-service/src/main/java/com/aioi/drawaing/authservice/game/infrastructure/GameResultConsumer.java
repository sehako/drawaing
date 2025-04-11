package com.aioi.drawaing.authservice.game.infrastructure;

import com.aioi.drawaing.authservice.game.infrastructure.dto.GameResultEventList;
import com.aioi.drawaing.authservice.ranking.application.RankingService;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameResultConsumer {
    private final RankingService rankingService;

    /**
     * GameResultEvent 수신하여 랭킹 점수, 승리 여부 반영
     *
     * @param events GameResultEvent 객체 (멤버 ID, 승리 여부, 랭킹 점수, 경험치, 포인트)
     */
    @KafkaListener(
            topics = "game-result-events",
            containerFactory = "rankScoreEventListenerContainerFactory",// 지정해줘야 됨
            groupId = "ranking-group"
    )
    public void handleRankScoreEvent(GameResultEventList events) {
        log.info("Received ranking-group GameResultEvent: {}", events);

        try {
            List<GameResultRequest> gameResultRequests = events.stream()
                    .map(GameResultRequest::from)
                    .toList();

            rankingService.updateGameRecords(gameResultRequests);
            log.info("Successfully processed {} RankScore updates", events.size());

        } catch (RuntimeException e) {
            log.error("RankScore update failed for {} events: {}", events.size(), e.getMessage());
            // 실패 이벤트 발행 로직 추가

        } catch (Exception e) {
            log.error("Critical error processing {} events: {}", events.size(), e.getMessage());
            throw new RuntimeException("RankScore processing failure", e);
        }
    }

}
