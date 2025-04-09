package com.aioi.drawaing.drawinggameservice.drawing.infrastructure;

import com.aioi.drawaing.drawinggameservice.drawing.application.dto.GameResultEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KafkaService {
    private final KafkaTemplate<String, List<GameResultEvent>> kafkaTemplateGameEvent;

    public void sendGameEvent(String topic, List<GameResultEvent> gameResultEvent) {
        kafkaTemplateGameEvent.send(topic, gameResultEvent);
    }

}
