package com.aioi.drawaing.drawinggameservice.common.socket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

@Slf4j
@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // STOMP 헤더에서 Authorization 값 가져오기
        String authToken = accessor.getFirstNativeHeader("Authorization");

        log.info("Received STOMP Authorization header: {}", authToken);

        return message;
    }
}
