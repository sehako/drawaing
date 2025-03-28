// useGameTimer.ts 수정
import { useState, useEffect, useCallback } from 'react';
import gameTimerService, { TimerData, DEFAULT_TIMER_VALUES } from '../api/gameTimerService';
import { Client } from '@stomp/stompjs';

interface UseGameTimerProps {
  roomId?: string;
  sessionId?: string;
  isGameOver?: boolean;
}

interface UseGameTimerResult {
  totalTime: number;
  drawTime: number;
  gameTimeLeft: number;
  setGameTimeLeft: (value: React.SetStateAction<number>) => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * 게임 타이머 관련 커스텀 훅
 */
const useGameTimer = ({
  roomId,
  sessionId,
  isGameOver = false
}: UseGameTimerProps): UseGameTimerResult => {
  // 상태 관리
  const [timerData, setTimerData] = useState<TimerData>(DEFAULT_TIMER_VALUES);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(DEFAULT_TIMER_VALUES.totalTime);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  
  // 타이머 업데이트 콜백
  const handleTimerUpdate = useCallback((data: TimerData) => {
    // console.log('타이머 업데이트 수신:', data);
    setTimerData(data);
    
    // 게임 시간이 초기화되지 않았거나 0인 경우에만 totalTime으로 설정
    if (gameTimeLeft === DEFAULT_TIMER_VALUES.totalTime || gameTimeLeft === 0) {
      setGameTimeLeft(data.totalTime);
    }
    
    setIsLoading(false);
  }, [gameTimeLeft]);
  
  // Stomp 연결 설정
  useEffect(() => {
    if (!roomId || !sessionId || isGameOver) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // console.log('타이머 구독 시작:', roomId, sessionId);
      const client = gameTimerService.subscribeToTimerUpdates(
        roomId, 
        sessionId, 
        handleTimerUpdate
      );
      
      setStompClient(client);
      
      return () => {
        // console.log('타이머 구독 정리');
        if (client.connected) {
          client.deactivate();
        }
      };
    } catch (err) {
      // console.error('타이머 구독 오류:', err);
      setError(err instanceof Error ? err : new Error('타이머 구독 중 오류 발생'));
      setIsLoading(false);
    }
  }, [roomId, sessionId, isGameOver, handleTimerUpdate]);
  
  // 게임 타이머 카운트다운
  useEffect(() => {
    if (isGameOver) return;
    
    const gameTimer = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(gameTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(gameTimer);
  }, [isGameOver]);
  
  return {
    totalTime: timerData.totalTime,
    drawTime: timerData.drawTime,
    gameTimeLeft,
    setGameTimeLeft,
    isLoading,
    error
  };
};

export default useGameTimer;