package com.aioi.drawaing.drawinggameservice.chat.presentation;

import static org.assertj.core.api.Assertions.assertThat;

import com.aioi.drawaing.drawinggameservice.chat.application.ChatService;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatEmoji;
import com.aioi.drawaing.drawinggameservice.chat.domain.ChatMessage;
import java.lang.reflect.Type;
import java.util.concurrent.BlockingDeque;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ChatControllerTest {

    private BlockingDeque<ChatMessage> messages;
    private BlockingDeque<ChatEmoji> emojis;
    private StompSession stompSession;
    private WebSocketStompClient webSocketStompClient;

    @LocalServerPort
    private int port;

    @Autowired
    private ChatService chatService;

    @BeforeEach
    public void setUp() {
        StandardWebSocketClient webSocketClient = new StandardWebSocketClient();
        messages = new LinkedBlockingDeque<>();
        emojis = new LinkedBlockingDeque<>();
        webSocketStompClient=new WebSocketStompClient(webSocketClient);
        webSocketStompClient.setMessageConverter(new MappingJackson2MessageConverter());
        try {
            stompSession = webSocketStompClient.connectAsync("ws://localhost:"+port+"/drawing", new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void 채팅_메시지_웹소켓_통신_테스트() throws Exception {
        //given
        String roomId = "testRoom123";
        ChatMessage testMessage = ChatMessage.builder()
                .senderId("user123")
                .roomId(roomId)
                .message("테스트 메시지 내용")
                .build();
        // 구독 설정
        stompSession.subscribe("/topic/chat.message/" + roomId, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatMessage.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messages.offer((ChatMessage) payload);
            }
        });
        // when
        stompSession.send("/app/chat.message/" + roomId, testMessage);
        // then
        ChatMessage receivedMessage = messages.poll(3, TimeUnit.SECONDS);
        // 수신 메시지 검증
        assertThat(receivedMessage).isNotNull();
        assertThat(receivedMessage.getMessage()).isEqualTo("테스트 메시지 내용");
        assertThat(receivedMessage.getSenderId()).isEqualTo("user123");
        assertThat(receivedMessage.getRoomId()).isEqualTo(roomId);
        // MongoDB 저장 검증
        ChatMessage savedMessage = chatService.findLatestMessageByRoomId(roomId);
        assertThat(savedMessage).isNotNull();
        assertThat(savedMessage.getId()).isNotNull();  // MongoDB에서 자동 생성된 ID 확인
        assertThat(savedMessage.getMessage()).isEqualTo(testMessage.getMessage());
        assertThat(savedMessage.getSenderId()).isEqualTo(testMessage.getSenderId());
    }


    @Test
    void 채팅_감정표현_웹소켓_통신_테스트() throws Exception {
        //given
        String roomId = "testRoom123";
        ChatEmoji testEmoji = ChatEmoji.builder()
                .senderId("user123")
                .roomId(roomId)
                .emoji("😸")
                .build();
        // 구독 설정
        stompSession.subscribe("/topic/chat.emoji/" + roomId, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatEmoji.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                emojis.offer((ChatEmoji) payload);
            }
        });
        // when
        stompSession.send("/app/chat.emoji/" + roomId, testEmoji);
        // then
        ChatEmoji receivedEmoji = emojis.poll(3, TimeUnit.SECONDS);
        // 수신 메시지 검증
        assertThat(receivedEmoji).isNotNull();
        assertThat(receivedEmoji.getEmoji()).isEqualTo("😸");
        assertThat(receivedEmoji.getSenderId()).isEqualTo("user123");
        assertThat(receivedEmoji.getRoomId()).isEqualTo(roomId);
        // MongoDB 저장 검증
        ChatEmoji savedEmoji = chatService.findLatestEmojiByRoomId(roomId);
        assertThat(savedEmoji).isNotNull();
        assertThat(savedEmoji.getId()).isNotNull();  // MongoDB에서 자동 생성된 ID 확인
        assertThat(savedEmoji.getEmoji()).isEqualTo(testEmoji.getEmoji());
        assertThat(savedEmoji.getSenderId()).isEqualTo(testEmoji.getSenderId());
    }
}
