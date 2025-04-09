package com.aioi.drawaing.shopservice.common.kafka;

import com.aioi.drawaing.shopservice.store.domain.DeductPointEvent;
import com.aioi.drawaing.shopservice.store.domain.PurchaseEvent;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, PurchaseEvent> purchaseEventProducerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class); // 직렬화 설정
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class); // 직렬화 설정
        // DTO 매핑
//        config.put(JsonSerializer.TYPE_MAPPINGS,
//                "PurchaseEvent:com.aioi.drawaing.shopservice.store.domain.PurchaseEvent");

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public ProducerFactory<String, DeductPointEvent> deductPointEventProducerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
//        config.put(JsonSerializer.TYPE_MAPPINGS,
//                "DeductPointEvent:com.aioi.drawaing.shopservice.store.domain.DeductPointEvent");

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, PurchaseEvent> purchaseEventKafkaTemplate() {
        return new KafkaTemplate<>(purchaseEventProducerFactory());
    }

    @Bean
    public KafkaTemplate<String, DeductPointEvent> deductPointEventKafkaTemplate() {
        return new KafkaTemplate<>(deductPointEventProducerFactory());
    }
}



