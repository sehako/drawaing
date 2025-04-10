package com.aioi.drawaing.authservice.member.infrastructure;

import com.aioi.drawaing.authservice.game.infrastructure.dto.GameResultEventList;
import com.aioi.drawaing.authservice.member.application.MemberService;
import com.aioi.drawaing.authservice.member.infrastructure.dto.DeductPointEvent;
import com.aioi.drawaing.authservice.member.presentation.request.MemberExpUpdateRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemberConsumer {

    private final MemberService memberService;

    /**
     * DeductPointEvent를 수신하여 포인트 차감을 처리합니다.
     *
     * @param event DeductPointEvent 객체 (멤버 ID, 차감 포인트 포함)
     */
    @KafkaListener(
            topics = "deduct-points",
            containerFactory = "deductPointEventListenerContainerFactory",// 지정해줘야 됨
            groupId = "member-group"
    )
    public void handleDeductPointEvent(DeductPointEvent event) {
        log.info("Received DeductPointEvent: {}", event);

        try {
            // 1. 포인트 차감 로직 실행
            memberService.deductPoints(event.memberId(), event.price());
            log.info("Successfully deducted points for member: {}", event.memberId());

        } catch (RuntimeException e) {
            // 2. 포인트 부족 예외 처리
            log.error("Insufficient points for member: {}", event.memberId());
            //kafkaTemplate.send("deduct-points-failed", event);  // 실패 이벤트 발행

        } catch (Exception e) {
            // 3. 기타 예외 처리 (재시도 또는 알림)
            log.error("Error processing DeductPointEvent: {}", e.getMessage());
            throw new RuntimeException("Failed to process DeductPointEvent", e);
        }
    }

    /**
     * GameResultEvent 수신하여 경험치, 포인트 반영
     *
     * @param events GameResultEvent 객체 (멤버 ID, 승리 여부, 랭킹 점수, 경험치, 포인트)
     */
    @KafkaListener(
            topics = "game-result-events",
            containerFactory = "expEventListenerContainerFactory",// 지정해줘야 됨
            groupId = "member-group"
    )
    public void handleExpEvent(GameResultEventList events) {
        log.info("Received member-group GameResultEvent: {}", events);

        try {
            List<MemberExpUpdateRequest> memberExpUpdateRequests = events.stream()
                    .map(MemberExpUpdateRequest::from) // 메서드 참조 사용
                    .toList();
            memberService.expUpdate(memberExpUpdateRequests);
            log.info("Successfully Exp, Point Update");

        } catch (RuntimeException e) {
            log.error("Insufficient Exp, Point Update: {}", e.getMessage());
            // 실패 이벤트 발행
        } catch (Exception e) {
            // 3. 기타 예외 처리 (재시도 또는 알림)
            log.error("Error processing member-group GameResultEvent: {}", e.getMessage());
            throw new RuntimeException("Failed to process member-group GameResultEvent", e);
        }
    }
}

