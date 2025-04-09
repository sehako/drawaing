package com.aioi.drawaing.shopservice.inventory.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.ContainerTestUtils;

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"purchase-events"}, brokerProperties = {"listeners=PLAINTEXT://localhost:9092",
        "port=9092"})
class PurchaseEventConsumerTest {

    @Autowired
    private KafkaTemplate<String, PurchaseEvent> kafkaTemplate;

    @Autowired
    private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    private static CountDownLatch latch = new CountDownLatch(1);
    private static PurchaseEvent receivedEvent;

    @KafkaListener(topics = "purchase-events", groupId = "test-group")
    public void testConsume(PurchaseEvent event) {
        receivedEvent = event;
        latch.countDown();
    }

    @Test
    void testConsumeMessage() throws InterruptedException {
        // Given: 테스트 이벤트 생성
        PurchaseEvent event = new PurchaseEvent(123L, 456L, 20, 10, LocalDateTime.now());

        // When: Kafka에 메시지 전송
        kafkaTemplate.send("purchase-events", event);

        // Ensure the consumer is ready to consume the message
        for (MessageListenerContainer container : kafkaListenerEndpointRegistry.getListenerContainers()) {
            ContainerTestUtils.waitForAssignment(container, 1);
        }

        // Then: 메시지가 소비되었는지 확인
        boolean messageConsumed = latch.await(10, TimeUnit.SECONDS); // 최대 10초 대기
        assertThat(messageConsumed).isTrue();
        assertThat(receivedEvent).isNotNull();
        assertThat(receivedEvent.memberId()).isEqualTo(123L);
        assertThat(receivedEvent.itemId()).isEqualTo(456L);
        assertThat(receivedEvent.quantity()).isEqualTo(10);
    }
}
