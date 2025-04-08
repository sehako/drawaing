package com.aioi.drawaing.shopservice.common.kafka;

import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.mapping.DefaultJackson2JavaTypeMapper;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, PurchaseEvent> purchaseEventConsumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "inventory-group");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        JsonDeserializer<PurchaseEvent> deserializer = new JsonDeserializer<>(PurchaseEvent.class);
        deserializer.addTrustedPackages("com.aioi.drawaing");
        deserializer.setTypeMapper(new DefaultJackson2JavaTypeMapper());

        return new DefaultKafkaConsumerFactory<>(
                config,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PurchaseEvent>
    purchaseEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, PurchaseEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(purchaseEventConsumerFactory());
        // 에러 핸들러 설정
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                (record, exception) -> { /* DLQ 전송 로직 */ },
                new FixedBackOff(1000L, 3L) // 3회 재시도
        );
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }
}

