import { useState, useEffect, useCallback, useRef } from 'react';
import gameTimerService, { TimerData, DEFAULT_TIMER_VALUES } from '../api/gameTimerService';
import WebSocketService from '../hooks/WebSocketService';

interface UseGameTimerProps {
  roomId?: string;
  sessionId?: string;
  isGameOver?: boolean;
  onTimerEnd?: () => void; // 타이머 종료 콜백 추가
}

interface UseGameTimerResult {
  totalTime: number;
  drawTime: number;
  gameTimeLeft: number;
  setGameTimeLeft: (value: React.SetStateAction<number>) => void;
  isLoading: boolean;
  error: Error | null;
}

const useGameTimer = ({
  roomId,
  sessionId,
  isGameOver = false,
  onTimerEnd // 타이머 종료 콜백
}: UseGameTimerProps): UseGameTimerResult => {
  
  const [timerData, setTimerData] = useState<TimerData>(DEFAULT_TIMER_VALUES);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(DEFAULT_TIMER_VALUES.totalTime);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 구독 취소 함수를 저장할 ref
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
  // 타이머 업데이트 콜백
  const handleTimerUpdate = useCallback((data: TimerData) => {
    setTimerData(data);
    
    // 조건 없이 백엔드에서 받은 totalTime으로 gameTimeLeft 항상 업데이트
    setGameTimeLeft(data.totalTime);
    
    setIsLoading(false);
  }, []);
  
  // Stomp 연결 및 구독 설정
  useEffect(() => {
    if (!roomId || !sessionId || isGameOver) return;
    
    setIsLoading(true);
    setError(null);
    
    const setupTimerSubscription = async () => {
      try {
        // WebSocketService를 통해 연결
        await WebSocketService.connect(roomId, sessionId);
        console.log('타이머 웹소켓 연결됨:', roomId, sessionId);
        
        // 타이머 토픽 구독
        const unsubscribe = WebSocketService.subscribe<TimerData>(
          `/topic/session.timer/${roomId}/${sessionId}`, 
          (data) => {
            console.log('타이머 데이터 수신:', data);
            const timerData: TimerData = {
              totalTime: data.totalTime ?? DEFAULT_TIMER_VALUES.totalTime,
              drawTime: data.drawTime ?? DEFAULT_TIMER_VALUES.drawTime
            };
            handleTimerUpdate(timerData);
          }
        );
        
        // 구독 취소 함수 저장
        unsubscribeRef.current = unsubscribe;
        
        // 초기 타이머 정보 요청
        console.log('초기 타이머 정보 요청');
        WebSocketService.publish(
          `/app/game/drawing/timer/request/${roomId}/${sessionId}`,
          { requestInitialState: true }
        );
      } catch (err) {
        console.error('타이머 구독 오류:', err);
        setError(err instanceof Error ? err : new Error('타이머 구독 중 오류 발생'));
        setIsLoading(false);
      }
    };
    
    setupTimerSubscription();
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [roomId, sessionId, isGameOver, handleTimerUpdate]);
  
  // 게임 타이머 카운트다운 수정: 결과 페이지 리다이렉트 대신 콜백 호출
  useEffect(() => {
    if (isGameOver) return;
    
    console.log('로컬 타이머 시작:', gameTimeLeft);
    
    const gameTimer = setInterval(() => {
      setGameTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          clearInterval(gameTimer);
          
          // 시간이 0이 되면 모달을 표시하기 위해 콜백 함수 호출
          if (onTimerEnd) {
            console.log('타이머 종료, 게임 종료 모달 표시');
            onTimerEnd();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => {
      clearInterval(gameTimer);
    };
  }, [isGameOver, onTimerEnd]);

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