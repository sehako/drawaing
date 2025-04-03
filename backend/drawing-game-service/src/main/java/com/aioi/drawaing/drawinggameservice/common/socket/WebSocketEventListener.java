package com.aioi.drawaing.drawinggameservice.common.socket;

import com.aioi.drawaing.drawinggameservice.common.jwt.BearerParser;
import com.aioi.drawaing.drawinggameservice.common.jwt.JwtProvider;
import io.lettuce.core.RedisException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final JwtProvider jwtProvider;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        String authToken = headerAccessor.getFirstNativeHeader("Authorization");
        log.info("🔑 Received STOMP Authorization header: {}", authToken);
        try{
            String parse = BearerParser.parse(authToken);
            String userId = jwtProvider.getUserId(parse);
            log.info("userId!!!!!!!!!!!{}", userId);
        }catch (Exception e){
            log.error("JWT Parsing Error");
            throw new RuntimeException("JWT Parsing Error");
        }

        String sessionId = headerAccessor.getSessionId();
        log.info("STOMP Connected at: {}, sessionId: {}", LocalDateTime.now(), sessionId);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        log.info("STOMP Disconnected at: {}, sessionId: {}", LocalDateTime.now(), sessionId);
    }
}
