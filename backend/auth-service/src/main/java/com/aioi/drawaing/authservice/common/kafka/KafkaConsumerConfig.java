package com.aioi.drawaing.authservice.common.kafka;

import com.aioi.drawaing.authservice.game.infrastructure.dto.GameResultEventList;
import com.aioi.drawaing.authservice.member.infrastructure.dto.DeductPointEvent;
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
import org.springframework.kafka.support.mapping.DefaultJackson2JavaTypeMapper;
import org.springframework.kafka.support.serializer.JsonDeserializer;

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, DeductPointEvent> deductPointEventConsumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "member-group");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        JsonDeserializer<DeductPointEvent> deserializer = new JsonDeserializer<>(DeductPointEvent.class);
        deserializer.addTrustedPackages("com.aioi.drawaing");
        deserializer.setTypeMapper(new DefaultJackson2JavaTypeMapper());

        return new DefaultKafkaConsumerFactory<>(
                config,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConsumerFactory<String, GameResultEventList> expEventConsumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "member-group");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        JsonDeserializer<GameResultEventList> deserializer = new JsonDeserializer<>(GameResultEventList.class);
        deserializer.addTrustedPackages("com.aioi.drawaing");
        deserializer.setTypeMapper(new DefaultJackson2JavaTypeMapper());

        // ErrorHandlingDeserializer 적용
        return new DefaultKafkaConsumerFactory<>(
                config,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConsumerFactory<String, GameResultEventList> rankScoreEventConsumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "ranking-group");
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        JsonDeserializer<GameResultEventList> deserializer = new JsonDeserializer<>(GameResultEventList.class);
        deserializer.addTrustedPackages("com.aioi.drawaing");
        deserializer.setTypeMapper(new DefaultJackson2JavaTypeMapper());

        // ErrorHandlingDeserializer 적용
        return new DefaultKafkaConsumerFactory<>(
                config,
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, DeductPointEvent>
    deductPointEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, DeductPointEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(deductPointEventConsumerFactory());
        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, GameResultEventList>
    expEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, GameResultEventList> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(expEventConsumerFactory());
        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, GameResultEventList>
    rankScoreEventListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, GameResultEventList> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(rankScoreEventConsumerFactory());
        return factory;
    }
}
