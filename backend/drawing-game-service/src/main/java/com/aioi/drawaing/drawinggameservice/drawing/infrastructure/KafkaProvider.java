package com.aioi.drawaing.drawinggameservice.drawing.infrastructure;

import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.dto.GameResultEventList;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProvider {
    private final KafkaTemplate<String, GameResultEventList> kafkaTemplateGameEvent;

    public void sendGameEvent(String topic, GameResultEventList gameResultEventList){
        kafkaTemplateGameEvent.send(topic, gameResultEventList);
    }

}
