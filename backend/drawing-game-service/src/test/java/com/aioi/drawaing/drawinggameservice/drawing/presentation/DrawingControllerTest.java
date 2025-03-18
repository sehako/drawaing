package com.aioi.drawaing.drawinggameservice.drawing.presentation;

import static org.assertj.core.api.Assertions.assertThat;

import com.aioi.drawaing.drawinggameservice.drawing.presentation.dto.DrawInfo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT) // ✅ 추가
public class DrawingControllerTest {

    private BlockingDeque<Object> messages;
    private StompSession stompSession;
    private WebSocketStompClient webSocketStompClient;
    @LocalServerPort
    private int port;

    @BeforeEach
    public void setUp() {
        StandardWebSocketClient webSocketClient = new StandardWebSocketClient();
        messages = new LinkedBlockingDeque<>();
        webSocketStompClient=new WebSocketStompClient(webSocketClient);
        webSocketStompClient.setMessageConverter(new MappingJackson2MessageConverter());
        try {
            stompSession = webSocketStompClient.connectAsync("ws://localhost:"+port+"/drawing", new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            throw new RuntimeException(e);
        }
    }

    @DisplayName("유저가 그림 데이터를 보냈을 때, 서버에 보내지는지 확인한다.")
    @Test
    public void 그림_데이터_보내기_성공_유무() throws InterruptedException, JsonProcessingException {
        String roomId="room1";
        String sessionId="session1";

        stompSession.subscribe("/topic/session.draw/"+roomId+"/"+sessionId, new StompFrameHandler() {

            @Override
            public Type getPayloadType(StompHeaders headers) {
                return new ParameterizedTypeReference<List<DrawInfo>>() {}.getType();
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messages.offer(payload);
            }
        });

        List<DrawInfo> drawInfos = new ArrayList<>();
        drawInfos.add(new DrawInfo(1.2f,2.3f));
        drawInfos.add(new DrawInfo(0.2f,0.3f));

        stompSession.send("/app/session.draw/"+roomId+"/"+sessionId, drawInfos);

        ObjectMapper objectMapper = new ObjectMapper();
        String expectedJson = objectMapper.writeValueAsString(drawInfos);
        String actualJson = objectMapper.writeValueAsString(messages.poll(3, TimeUnit.SECONDS));

        assertThat(actualJson).isEqualTo(expectedJson);
    }

//    @DisplayName("유저가 메세지를 보냈을 때 서버에 보내지는지 확인한다.")
//    @Test
//    public void 메세지_보내기_성공_유무() {
//        stompSession.subscribe("/topic/1", new StompFrameHandler() {
//
//            @Override
//            public Type getPayloadType(StompHeaders headers) {
//                return String.class;
//            }
//
//            @Override
//            public void handleFrame(StompHeaders headers, Object payload) {
//                messages.offer(payload.toString());
//            }
//        });
//
//        stompSession.send("/app/send", "HelloWorld");
//
//        try {
//            assertThat(messages.poll(3,TimeUnit.SECONDS)).isEqualTo("HelloWorld");
//        } catch (InterruptedException e) {
//            throw new RuntimeException(e);
//        }
//    }
}
