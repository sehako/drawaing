import WebSocketService from '../hooks/WebSocketService';

// 기존 인터페이스와 상수 유지
export interface TimerData {
 totalTime: number;
 drawTime: number;
}

export const DEFAULT_TIMER_VALUES = {
 totalTime: 600,
 drawTime: 20
};

interface ResetTimerParams {
 currentRound?: number;
 currentDrawerIndex?: number;
 newDrawTime: number;
}

const gameTimerService = {
 /**
  * 타이머 정보 구독
  */
 subscribeToTimerUpdates(
   roomId: string, 
   sessionId: string, 
   onTimerUpdate?: (data: TimerData) => void
 ): () => void {
   const destination = `/topic/session.timer/${roomId}/${sessionId}`;
   
   const unsubscribe = WebSocketService.subscribe<any>(destination, (data) => {
     try {
       const timerData: TimerData = {
         totalTime: data.totalTime ?? DEFAULT_TIMER_VALUES.totalTime,
         drawTime: data.drawTime ?? DEFAULT_TIMER_VALUES.drawTime
       };
       
       if (onTimerUpdate) {
         onTimerUpdate(timerData);
       }
     } catch (error) {
       console.error('타이머 데이터 파싱 오류:', error);
       if (onTimerUpdate) onTimerUpdate(DEFAULT_TIMER_VALUES);
     }
   });

   // 초기 타이머 정보 요청
   WebSocketService.publish(
     `/app/game/drawing/timer/request/${roomId}/${sessionId}`,
     { requestInitialState: true }
   );

   return unsubscribe;
 },

 /**
  * 턴 타이머 리셋 요청
  */
 resetTurnTimer(
   roomId: string, 
   sessionId: string,
   params: {
     currentRound?: number;
     currentDrawerIndex?: number;
     newDrawTime: number;
   }
 ): boolean {
   return WebSocketService.publish(
     `/app/session.end/${roomId}/${sessionId}`,
     {
       roomId,
       sessionId,
       ...params
     }
   );
 }
};

export default gameTimerService;