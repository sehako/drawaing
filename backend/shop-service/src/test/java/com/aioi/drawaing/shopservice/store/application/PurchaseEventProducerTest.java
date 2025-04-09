package com.aioi.drawaing.shopservice.store.application;

import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

@SpringBootTest
class PurchaseEventProducerTest {

    @Autowired
    private KafkaTemplate<String, PurchaseEvent> kafkaTemplate;

    @Test
    void testSendMessage() {
        // Given: 테스트 이벤트 생성
        PurchaseEvent event = new PurchaseEvent(123L, 456L, 20, 10, LocalDateTime.now());

        // When: Kafka에 메시지 전송
        CompletableFuture<SendResult<String, PurchaseEvent>> future = kafkaTemplate.send("purchase-events", event);

        // Then: 메세지가 성공적으로 전송되었는지 확인
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                // 성공적으로 메시지 전송됨
                System.out.println("Message sent successfully to topic " + result.getRecordMetadata().topic());
            } else {
                // 메시지 전송 실패
                System.err.println("Failed to send message: " + ex.getMessage());
            }
        });
    }
}


