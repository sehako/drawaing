import { Client } from '@stomp/stompjs';

// 좌표 인터페이스
export interface DrawPoint {
  x: number;
  y: number;
}

// 사용자별 그림 데이터 인터페이스 (변경됨)
export interface DrawingData {
  [userId: number]: DrawPoint[];
}

// 웹소켓 콜백 타입
export type DrawPointCallback = (drawingData: DrawingData) => void;

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
            const drawingData: DrawingData = JSON.parse(message.body);
            
            // 상세 로깅 추가
            console.group('🎨 웹소켓 그림 데이터 수신');
            console.log('원본 메시지:', message.body);
            console.log('파싱된 데이터:', JSON.stringify(drawingData, null, 2));
            console.log('수신 데이터 구조:', Object.keys(drawingData));
            // console.log('첫 번째 데이터 포인트 개수:', 
            //   drawingData[Object.keys(drawingData)[0]]?.length || 0
            // );
            console.groupEnd();

            callback(drawingData);
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

  // 그리기 포인트 전송 (변경됨)
  public sendDrawingPoints(
    roomId: string, 
    sessionId: string, 
    userId: number,
    points: DrawPoint[]
  ): boolean {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
      return false;
    }

    try {
      // 사용자 ID를 키로 하는 데이터 구조 생성
      const drawingData: DrawingData = {
        [userId]: points
      };
      
      // 상세 로깅 추가
      console.group('🖌️ 웹소켓 그림 데이터 전송');
      console.log('전송 대상 방 ID:', roomId);
      console.log('세션 ID:', sessionId);
      console.log('사용자 ID:', userId);
      console.log('전송 데이터:', JSON.stringify(drawingData, null, 2));
      console.log('전송 포인트 개수:', points.length);
      console.groupEnd();

      this.stompClient.publish({
        destination: `/app/session.draw/${roomId}/${sessionId}`,
        body: JSON.stringify(drawingData)
      });

      console.log(`그림 데이터 전송: 사용자 ${userId}, ${points.length}개 포인트`);
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