import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  // 라우터 네비게이션 추가
  const navigate = useNavigate();
  
  // 상태 관리
  const [timerData, setTimerData] = useState<TimerData>(DEFAULT_TIMER_VALUES);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(DEFAULT_TIMER_VALUES.totalTime);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [redirectTriggered, setRedirectTriggered] = useState<boolean>(false);
  
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
      console.log('타이머 구독 시작:', roomId, sessionId);
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
  
  // 게임 타이머 카운트다운 및 시간 종료 시 결과 페이지로 이동
  useEffect(() => {
    if (isGameOver) return;
    
    console.log('타이머 업데이트: 현재 시간', gameTimeLeft);
    
    // 이미 시간이 0이면 즉시 결과 페이지로 이동
    if (gameTimeLeft === 0 && !redirectTriggered && roomId) {
      console.log('시간이 0입니다! 즉시 결과 페이지로 이동합니다.');
      setRedirectTriggered(true);
      navigate(`/result/${roomId}`);
      return;
    }
    
    const gameTimer = setInterval(() => {
      setGameTimeLeft(prev => {
        const newTime = prev - 1;
        console.log('타이머 감소:', newTime);
        
        if (newTime <= 0) {
          clearInterval(gameTimer);
          
          // 시간이 0이 되면 결과 페이지로 이동
          if (!redirectTriggered && roomId) {
            console.log('타이머가 0이 되었습니다! 결과 페이지로 이동합니다.');
            setRedirectTriggered(true);
            
            // 즉시 이동
            navigate(`/result/${roomId}`);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => {
      console.log('타이머 정리');
      clearInterval(gameTimer);
    };
  }, [isGameOver, gameTimeLeft, redirectTriggered, roomId, navigate]);
  
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