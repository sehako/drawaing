package com.aioi.drawaing.drawinggameservice.drawing.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) // ✅ 추가
public class DrawingControllerTest {

    private BlockingDeque<String> messages;
    private StompSession stompSession;
    private WebSocketStompClient webSocketStompClient;
    @LocalServerPort
    private int port;


    @BeforeEach
    public void setUp() {
        StandardWebSocketClient webSocketClient = new StandardWebSocketClient();
        messages = new LinkedBlockingDeque<>();
        webSocketStompClient=new WebSocketStompClient(webSocketClient);
        webSocketStompClient.setMessageConverter(new StringMessageConverter());
        try {
            stompSession = webSocketStompClient.connectAsync("ws://localhost:"+port+"/drawing", new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            throw new RuntimeException(e);
        }
    }

    @DisplayName("유저가 메세지를 보냈을 때 서버에 보내지는지 확인한다.")
    @Test
    public void 메세지_보내기_성공_유무() {
        stompSession.subscribe("/topic/1", new StompFrameHandler() {

            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messages.offer(payload.toString());
            }
        });

        stompSession.send("/app/send", "HelloWorld");

        try {
            assertThat(messages.poll(3,TimeUnit.SECONDS)).isEqualTo("HelloWorld");
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
