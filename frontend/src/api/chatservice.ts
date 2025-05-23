import { Client } from '@stomp/stompjs';
import WebSocketService from '../hooks/WebSocketService';

// 채팅 메시지 인터페이스
export interface ChatMessage {
  senderId: number;
  message: string;
  createdAt?: string;
}

// 웹소켓 콜백 타입
export type ChatMessageCallback = (message: ChatMessage) => void;

class ChatMessageService {
  private static instance: ChatMessageService;
  private stompClient: Client | null = null;
  private chatMessageCallbacks: Map<string, ChatMessageCallback> = new Map();

  private constructor() {}

  // 싱글톤 패턴
  public static getInstance(): ChatMessageService {
    if (!ChatMessageService.instance) {
      ChatMessageService.instance = new ChatMessageService();
    }
    return ChatMessageService.instance;
  }

  // STOMP 클라이언트 초기화
  public initializeClient(roomId: string, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이미 연결된 경우 바로 리턴
      if (this.stompClient?.connected) {
        resolve();
        return;
      }

      const client = new Client({
        brokerURL: `wss://www.drawaing.site/service/game/drawing`,
        connectHeaders: {
          login: '',
          passcode: ''
        },
        debug: (str) => {
          console.log('STOMP 채팅 서비스:', str);
        },
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        console.log('STOMP 채팅 서비스 연결 성공');
        this.stompClient = client;
        
        // 모든 등록된 방에 대해 구독 재설정
        this.chatMessageCallbacks.forEach((callback, key) => {
          const [savedRoomId, savedSessionId] = key.split('|');
          this.subscribeToMessages(savedRoomId, savedSessionId, callback);
        });

        resolve();
      };

      client.onStompError = (frame) => {
        // console.error('STOMP 채팅 서비스 오류:', frame);
        reject(new Error(`STOMP 연결 오류: ${frame.headers?.message || 'Unknown error'}`));
      };

      client.activate();
    });
  }

  // 채팅 메시지 구독
public subscribeToMessages(
  roomId: string, 
  sessionId: string, 
  callback: ChatMessageCallback
): () => void {
  if (!this.stompClient || !this.stompClient.connected) {
    console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
    return () => {};
  }

  // 콜백 저장 (재연결 시 복원용)
  const key = `${roomId}|${sessionId}`;
  this.chatMessageCallbacks.set(key, callback);

  try {
    console.log(`채팅 구독 시작: /topic/chat.message/${roomId}/${sessionId}`);
    
    const subscription = this.stompClient.subscribe(
      `/topic/chat.message/${roomId}/${sessionId}`, 
      (message) => {
        try {
          console.group('💬 채팅 메시지 수신 - 상세 로그');
          console.log('원본 메시지 객체:', message);
          console.log('메시지 본문:', message.body);
          console.log('메시지 헤더:', message.headers);
          
          const chatMessage: ChatMessage = JSON.parse(message.body);
          console.log('파싱된 데이터:', chatMessage);
          console.log('userId:', chatMessage.senderId);
          console.log('message:', chatMessage.message);
          console.log('createdAt:', chatMessage.createdAt);
          console.groupEnd();

          // 콜백 호출 전 로그 (오류 수정)
          console.log('콜백 함수 호출 시작');
          
          // 콜백 함수 호출
          callback(chatMessage);
          
          console.log('콜백 함수 호출 완료');
        } catch (error) {
          console.error('채팅 메시지 파싱/처리 오류:', error);
          console.error('문제가 된 원본 메시지:', message.body);
        }
      }
    );

    console.log(`채팅 메시지 구독 성공: ${roomId}/${sessionId}`);

    // 구독 취소 함수 반환
    return () => {
      subscription.unsubscribe();
      this.chatMessageCallbacks.delete(key);
      console.log(`채팅 구독 해제: ${roomId}/${sessionId}`);
    };
  } catch (error) {
    console.error('채팅 메시지 구독 중 오류:', error);
    return () => {};
  }
}

  // 메시지 전송 (채팅 또는 제시어)
// chatService.ts의 sendMessage 함수 수정
public sendMessage(
  roomId: string, 
  sessionId: string, 
  senderId: number,
  message: string
): boolean {
  if (!this.stompClient || !this.stompClient.connected) {
    console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
    return false;
  }

  try {
    // 예시와 동일한 형식의 객체 생성
    const chatMessage: ChatMessage = {
      senderId: senderId,
      message: message,
      createdAt: new Date().toISOString()
    };

    // AI 메시지인 경우 로그에 표시
    if (senderId === -1) {
      console.log('AI 메시지 전송:', message);
    }
    
    // 형식에 맞게 로깅 (예시 이미지와 동일하게)
    const formattedMessage = JSON.stringify(chatMessage, null, 2);
    console.log(formattedMessage); // 들여쓰기 포맷 적용된 JSON 문자열 출력
    
    // 또는 객체 형태로 직접 출력
    console.log({
      "userId": senderId,
      "message": message,
      "createdAt": chatMessage.createdAt
    });

    // 메시지 발행
    this.stompClient.publish({
      destination: `/app/chat.message/${roomId}/${sessionId}`,
      body: JSON.stringify(chatMessage)
    });

    return true;
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    return false;
  }
}
  // 연결 종료
  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.chatMessageCallbacks.clear();
      console.log('브로드캐스팅용 STOMP 채팅 서비스 연결 종료');
    }
  }
}

export default ChatMessageService.getInstance();