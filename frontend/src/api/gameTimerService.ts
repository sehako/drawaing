import { Client } from '@stomp/stompjs';
import axios from 'axios';

// 타이머 데이터 인터페이스
export interface TimerData {
  totalTime: number;
  drawTime: number;
}

// 기본 타이머 값
export const DEFAULT_TIMER_VALUES = {
  totalTime: 600,
  drawTime: 20
};

// 타이머 리셋 파라미터 인터페이스
interface ResetTimerParams {
  currentRound?: number;
  currentDrawerIndex?: number;
  newDrawTime: number;
}

/**
 * 게임 타이머 정보를 가져오는 서비스
 */
const gameTimerService = {
  /**
   * Stomp 클라이언트를 사용하여 타이머 정보 구독
   * @param roomId 방 ID
   * @param sessionId 세션 ID
   * @param onTimerUpdate 타이머 업데이트 콜백
   * @returns Stomp 클라이언트 객체
   */
  subscribeToTimerUpdates(
    roomId: string, 
    sessionId: string, 
    onTimerUpdate?: (data: TimerData) => void
  ): Client {
    const client = new Client({
      brokerURL: `wss://www.drawaing.site/service/game/drawing`,
      connectHeaders: {
        login: '',
        passcode: ''
      },
      debug: function(str) {
        // console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000
    });
    
    client.onConnect = (frame) => {
      // console.log('STOMP 연결 성공:', frame);
      
      // 타이머 업데이트 토픽 구독
      const subscription = client.subscribe(`/topic/session.timer/${roomId}/${sessionId}`, (message) => {
        // console.log('타이머 메시지 수신:', message);
        
        try {
          const data = JSON.parse(message.body);
          // console.log('파싱된 타이머 데이터:', data);
          
          const timerData: TimerData = {
            totalTime: data.totalTime ?? DEFAULT_TIMER_VALUES.totalTime,
            drawTime: data.drawTime ?? DEFAULT_TIMER_VALUES.drawTime
          };
          
          if (onTimerUpdate) {
            onTimerUpdate(timerData);
          }
        } catch (error) {
          // console.error('타이머 데이터 파싱 오류:', error);
          if (onTimerUpdate) onTimerUpdate(DEFAULT_TIMER_VALUES);
        }
      });
      
      // 초기 타이머 정보 요청 (필요한 경우)
      client.publish({
        destination: `/app/game/drawing/timer/request/${roomId}/${sessionId}`,
        body: JSON.stringify({ requestInitialState: true })
      });
    };
    
    client.onStompError = (frame) => {
      // console.error('STOMP 오류:', frame);
      if (onTimerUpdate) onTimerUpdate(DEFAULT_TIMER_VALUES);
    };
    
    // 연결 시작
    client.activate();
    // console.log('STOMP 연결 시도...');
    
    return client;
  },

  /**
   * 턴 타이머 리셋 요청
   * @param roomId 방 ID
   * @param sessionId 세션 ID
   * @param params 타이머 리셋 파라미터
   * @returns Promise<boolean> 타이머 리셋 성공 여부
   */
  resetTurnTimer(
    roomId: string, 
    sessionId: string,
    params: {
      currentRound?: number;
      currentDrawerIndex?: number;
      newDrawTime: number;
    }
  ): void {
    const client = new Client({
      brokerURL: `wss://www.drawaing.site/service/game/drawing`,
      connectHeaders: {
        login: '',
        passcode: ''
      },
      debug: function(str) {
        // console.log('STOMP: ' + str);
      }
    });

    client.onConnect = () => {
      client.publish({
        destination: `/app/session.end/${roomId}/${sessionId}`,
        body: JSON.stringify({
          roomId,
          sessionId,
          ...params
        })
      });

      // console.log('턴 타이머 리셋 메시지 전송:', params);
      
      // 연결 종료
      client.deactivate();
    };

    client.onStompError = (frame) => {
      // console.error('STOMP 오류:', frame);
    };

    // 연결 시작
    client.activate();
  }
};

export default gameTimerService;