import { Client } from '@stomp/stompjs';

// 좌표 인터페이스
export interface DrawPoint {
  x: number;
  y: number;
}

// 웹소켓 콜백 타입
export type DrawPointCallback = (points: DrawPoint[]) => void;

class DrawingWebSocket {
  private static instance: DrawingWebSocket;
  private stompClient: Client | null = null;
  private drawPointCallbacks: Map<string, DrawPointCallback> = new Map();

  private constructor() {}

  // 싱글톤 패턴
  public static getInstance(): DrawingWebSocket {
    if (!DrawingWebSocket.instance) {
      DrawingWebSocket.instance = new DrawingWebSocket();
    }
    return DrawingWebSocket.instance;
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
          console.log('STOMP 그림 서비스:', str);
        },
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        console.log('STOMP 그림 서비스 연결 성공');
        this.stompClient = client;
        
        // 모든 등록된 방에 대해 구독 재설정
        this.drawPointCallbacks.forEach((callback, key) => {
          const [savedRoomId, savedSessionId] = key.split('|');
          this.subscribeToDrawingPoints(savedRoomId, savedSessionId, callback);
        });

        resolve();
      };

      client.onStompError = (frame) => {
        console.error('STOMP 그림 서비스 오류:', frame);
        reject(new Error(`STOMP 연결 오류: ${frame.headers?.message || 'Unknown error'}`));
      };

      client.activate();
    });
  }

  // 그리기 포인트 구독
  public subscribeToDrawingPoints(
    roomId: string, 
    sessionId: string, 
    callback: DrawPointCallback
  ): () => void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
      return () => {};
    }

    // 콜백 저장 (재연결 시 복원용)
    const key = `${roomId}|${sessionId}`;
    this.drawPointCallbacks.set(key, callback);

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/session.draw/${roomId}/${sessionId}`, 
        (message) => {
          try {
            const points: DrawPoint[] = JSON.parse(message.body);
            console.log('서버에서 받은 그리기 포인트:', points);
            callback(points);
          } catch (error) {
            console.error('그림 데이터 파싱 오류:', error);
          }
        }
      );

      console.log(`그리기 포인트 구독 성공: ${roomId}/${sessionId}`);

      // 구독 취소 함수 반환
      return () => {
        subscription.unsubscribe();
        this.drawPointCallbacks.delete(key);
      };
    } catch (error) {
      console.error('그리기 포인트 구독 중 오류:', error);
      return () => {};
    }
  }

  // 그리기 포인트 전송
  public sendDrawingPoints(
    roomId: string, 
    sessionId: string, 
    points: DrawPoint[]
  ): boolean {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
      return false;
    }

    try {
      this.stompClient.publish({
        destination: `/app/session.draw/${roomId}/${sessionId}`,
        body: JSON.stringify(points)
      });

      console.log(`그림 데이터 전송: ${points.length}개 포인트`);
      return true;
    } catch (error) {
      console.error('그림 데이터 전송 오류:', error);
      return false;
    }
  }

  // 연결 종료
  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.drawPointCallbacks.clear();
      console.log('STOMP 그림 서비스 연결 종료');
    }
  }
}

export default DrawingWebSocket.getInstance();