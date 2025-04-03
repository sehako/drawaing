// src/api/sessionInfoService.ts
import { Client } from '@stomp/stompjs';

// 환경 변수 또는 설정에서 API URL 가져오기
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class SessionInfoService {
  private static instance: SessionInfoService;
  private stompClient: Client | null = null;
  private subscriptions: { [key: string]: any } = {};

  private constructor() {
    // 싱글톤 패턴
  }

  static getInstance(): SessionInfoService {
    if (!SessionInfoService.instance) {
      SessionInfoService.instance = new SessionInfoService();
    }
    return SessionInfoService.instance;
  }

  async initializeClient(roomId: string, sessionId: string): Promise<void> {
    if (this.stompClient && this.stompClient.connected) {
      console.log('STOMP 클라이언트가 이미 연결되어 있습니다.');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // STOMP 클라이언트 설정 (SockJS 없이 직접 WebSocket 사용)
        this.stompClient = new Client({
          // WebSocket 엔드포인트 URL (ws:// 또는 wss://)
          brokerURL: `${API_URL.replace('http://', 'ws://').replace('https://', 'wss://')}/ws`,
          
          // 디버그 로깅
          debug: (str) => {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[STOMP DEBUG]', str);
            }
          },
          
          // 추가 설정
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          
          // 필요한 헤더가 있으면 추가
          connectHeaders: {
            roomId,
            sessionId
          }
        });

        // 연결 설정
        this.stompClient.onConnect = () => {
          console.log('STOMP 클라이언트 연결됨');
          resolve();
        };

        this.stompClient.onStompError = (frame) => {
          console.error('STOMP 오류:', frame);
          reject(new Error(`STOMP 오류: ${frame.headers.message}`));
        };

        // 연결 시작
        this.stompClient.activate();
      } catch (error) {
        console.error('STOMP 클라이언트 초기화 오류:', error);
        reject(error);
      }
    });
  }

  subscribeToSessionInfo(
    roomId: string, 
    sessionId: string, 
    callback: (data: any) => void
  ): () => void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP 클라이언트가 연결되지 않았습니다.');
      return () => {};
    }

    const subscriptionKey = `session.info.${roomId}.${sessionId}`;
    
    // 이미 구독 중인 경우 기존 구독 해제
    if (this.subscriptions[subscriptionKey]) {
      this.subscriptions[subscriptionKey].unsubscribe();
      delete this.subscriptions[subscriptionKey];
    }

    // 새로운 구독 설정
    try {
      const subscription = this.stompClient.subscribe(
        `/topic/session.info/${roomId}/${sessionId}`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            callback(data);
          } catch (error) {
            console.error('메시지 처리 오류:', error);
          }
        }
      );

      // 구독 정보 저장
      this.subscriptions[subscriptionKey] = subscription;

      // 구독 해제 함수 반환
      return () => {
        if (this.subscriptions[subscriptionKey]) {
          this.subscriptions[subscriptionKey].unsubscribe();
          delete this.subscriptions[subscriptionKey];
          console.log(`세션 정보 구독 해제: ${subscriptionKey}`);
        }
      };
    } catch (error) {
      console.error('세션 정보 구독 오류:', error);
      return () => {};
    }
  }

  // 세션 정보 요청 메서드 (필요한 경우)
  requestSessionInfo(roomId: string, sessionId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP 클라이언트가 연결되지 않았습니다.');
      return;
    }

    try {
      this.stompClient.publish({
        destination: `/app/session.info/${roomId}/${sessionId}`,
        body: JSON.stringify({ request: 'info' })
      });
      console.log('세션 정보 요청 전송됨');
    } catch (error) {
      console.error('세션 정보 요청 오류:', error);
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      // 모든 구독 해제
      Object.keys(this.subscriptions).forEach(key => {
        this.subscriptions[key].unsubscribe();
        delete this.subscriptions[key];
      });

      // 클라이언트 연결 해제
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('STOMP 클라이언트 연결 해제됨');
    }
  }

  getClient(): Client | null {
    return this.stompClient;
  }
}

// 싱글톤 인스턴스 내보내기
const sessionInfoService = SessionInfoService.getInstance();
export default sessionInfoService;