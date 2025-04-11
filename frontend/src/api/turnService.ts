import { Client } from '@stomp/stompjs';

export interface TurnEndMessage {
  roomId: string;
  sessionId: string;
  currentRound: number;
  currentDrawerIndex: number;
  nextDrawerIndex: number;
}

class TurnService {
  private static instance: TurnService;
  private stompClient: Client | null = null;

  private constructor() {}

  public static getInstance(): TurnService {
    if (!TurnService.instance) {
      TurnService.instance = new TurnService();
    }
    return TurnService.instance;
  }

  public initializeClient(roomId: string, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
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
          console.log('턴 서비스 STOMP:', str);
        },
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        console.log('턴 종료 서비스 연결 성공');
        this.stompClient = client;
        resolve();
      };

      client.onStompError = (frame) => {
        console.error('턴 종료 서비스 연결 오류:', frame);
        reject(new Error(`STOMP 연결 오류: ${frame.headers?.message || 'Unknown error'}`));
      };

      client.activate();
    });
  }

  public sendTurnEnd(
    roomId: string, 
    sessionId: string, 
    currentRound: number, 
    currentDrawerIndex: number, 
    nextDrawerIndex: number
  ): boolean {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
      return false;
    }

    try {
      const turnEndMessage: TurnEndMessage = {
        roomId,
        sessionId,
        currentRound,
        currentDrawerIndex,
        nextDrawerIndex
      };

      console.log('턴 종료 메시지 전송:', turnEndMessage);

      this.stompClient.publish({
        destination: `/app/session.end/${roomId}/${sessionId}`,
        body: JSON.stringify(turnEndMessage)
      });

      return true;
    } catch (error) {
      console.error('턴 종료 메시지 전송 오류:', error);
      return false;
    }
  }

  public disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('턴 종료 서비스 연결 종료');
    }
  }
  public subscribeToTurnEvents(
    roomId: string,
    sessionId: string,
    callback: (turnData: any) => void
  ): () => void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP 클라이언트가 연결되지 않았습니다.');
      return () => {};
    }
  
    const subscription = this.stompClient.subscribe(
      `/app/session.end/${roomId}/${sessionId}`,
      (message) => {
        try {
          const turnData = JSON.parse(message.body);
          callback(turnData);
        } catch (error) {
          console.error('턴 이벤트 메시지 처리 중 오류:', error);
        }
      }
    );
  
    return () => {
      subscription.unsubscribe();
      console.log('턴 이벤트 구독 해제');
    };
  }
}

export default TurnService.getInstance();