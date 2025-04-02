import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebSocketStateRecovery } from '../utils/roomStateUtils';

export const useRefreshStateManagement = (
  stompClient: any, 
  user: any, 
  actualRoomId: string | null
) => {
  const navigate = useNavigate();
  const [isRecoveringState, setIsRecoveringState] = useState(false);

  useEffect(() => {
    // 실제 방 ID가 없으면 복구 중단
    if (!actualRoomId) return;

    const handleRefresh = async () => {
      setIsRecoveringState(true);
      
      try {
        const recoveryResult = await WebSocketStateRecovery.recoverWebSocketState(
          stompClient, 
          user, 
          actualRoomId,
          navigate
        );

        if (!recoveryResult) {
          navigate('/');
        }
      } catch (error) {
        console.error('상태 복구 중 오류:', error);
        navigate('/');
      } finally {
        setIsRecoveringState(false);
      }
    };

    // 페이지 로드 시 복구 시도
    handleRefresh();
  }, [stompClient, user, actualRoomId, navigate]);

  return { isRecoveringState };
};