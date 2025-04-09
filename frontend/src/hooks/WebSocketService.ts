// src/hooks/WebSocketService.ts
import { Client, IMessage } from '@stomp/stompjs';

class WebSocketService {
  private static instance: WebSocketService;
  private client: Client | null = null;
  private connectionCount = 0;
  private currentRoomId: string | null = null;
  private currentSessionId: string | null = null;
  private subscriptions: Map<string, () => void> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(roomId: string, sessionId: string): Promise<void> {
    // 이미 같은 방과 세션에 연결되어 있다면 바로 반환
    if (this.client?.connected && 
        this.currentRoomId === roomId && 
        this.currentSessionId === sessionId) {
      this.connectionCount++;
      console.log(`이미 ${roomId}/${sessionId}에 연결됨. 연결 카운트: ${this.connectionCount}`);
      return Promise.resolve();
    }

    // 다른 방/세션에 연결되어 있다면 먼저 연결 해제
    if (this.client?.connected) {
      this.disconnect();
    }

    this.connectionCount++;
    this.currentRoomId = roomId;
    this.currentSessionId = sessionId;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        brokerURL: 'wss://www.drawaing.site/service/game/drawing',
        connectHeaders: { 
          roomId, 
          sessionId,
          login: '',
          passcode: ''
        },
        debug: (str) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[WebSocket:${roomId}:${sessionId}]`, str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 30000,
        heartbeatOutgoing: 30000,
      });

      this.client.onConnect = (frame) => {
        console.log(`WebSocket 연결 성공: ${roomId}/${sessionId}`, frame);
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error(`WebSocket 연결 오류: ${roomId}/${sessionId}`, frame);
        this.connectionCount--;
        reject(new Error(`연결 오류: ${frame.headers?.message}`));
      };

      this.client.activate();
    });
  }

  public subscribe<T>(
    destination: string, 
    callback: (data: T) => void
  ): () => void {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket 연결되지 않음');
      return () => {};
    }

    const subscription = this.client.subscribe(
      destination, 
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error(`메시지 파싱 오류 - ${destination}:`, error);
        }
      }
    );

    // 구독 취소 함수 반환
    const unsubscribe = () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };

    this.subscriptions.set(destination, unsubscribe);
    return unsubscribe;
  }

  public publish(
    destination: string, 
    body: any
  ): boolean {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket 연결되지 않음');
      return false;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
      return true;
    } catch (error) {
      console.error(`메시지 전송 오류 - ${destination}:`, error);
      return false;
    }
  }

  public disconnect(): void {
    this.connectionCount--;

    console.log(`연결 해제 시도. 현재 연결 카운트: ${this.connectionCount}`);

    if (this.connectionCount <= 0) {
      if (this.client) {
        console.log(`WebSocket 연결 종료: ${this.currentRoomId}/${this.currentSessionId}`);
        
        // 모든 구독 해제
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions.clear();

        this.client.deactivate();
        this.client = null;
        this.currentRoomId = null;
        this.currentSessionId = null;
        this.connectionCount = 0;
      }
    }
  }

  // 현재 연결 상태 확인용 메서드
  public getConnectionStatus() {
    return {
      isConnected: !!this.client?.connected,
      roomId: this.currentRoomId,
      sessionId: this.currentSessionId,
      connectionCount: this.connectionCount
    };
  }
}

export default WebSocketService.getInstance();