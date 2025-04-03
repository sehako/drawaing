import { NavigateFunction } from 'react-router-dom';

// 저장할 방 상태의 타입 정의
interface RoomState {
  roomId: string | null;
  roomCode: string | null;
  isHost: boolean;
  players: any[];
  currentUser: any;
  roomName?: string;
  timestamp: number;
}

export const RoomStateManager = {
  // 방 상태 저장
  saveRoomState: (roomState: Omit<RoomState, 'timestamp'>) => {
    try {
      // JSON으로 직렬화하여 저장
      localStorage.setItem('persistedRoomState', JSON.stringify({
        ...roomState,
        timestamp: new Date().getTime()
      }));

      // 개별 정보도 localStorage에 저장 (기존 코드와 호환)
      if (roomState.roomId) localStorage.setItem('roomId', roomState.roomId);
      if (roomState.roomCode) localStorage.setItem('roomCode', roomState.roomCode);
      localStorage.setItem('isHost', roomState.isHost.toString());
    } catch (error) {
      console.error('방 상태 저장 중 오류:', error);
    }
  },

  // 저장된 방 상태 복구
  restoreRoomState: (): RoomState | null => {
    try {
      const persistedState = localStorage.getItem('persistedRoomState');
      if (!persistedState) return null;

      const parsedState: RoomState = JSON.parse(persistedState);
      
      // 상태의 유효 시간 확인 (예: 30분)
      const MAX_STATE_AGE = 30 * 60 * 1000; // 30분
      const currentTime = new Date().getTime();
      
      if (currentTime - parsedState.timestamp > MAX_STATE_AGE) {
        // 상태가 너무 오래되었으면 제거
        localStorage.removeItem('persistedRoomState');
        return null;
      }

      return parsedState;
    } catch (error) {
      console.error('방 상태 복구 중 오류:', error);
      return null;
    }
  },

  // 상태 초기화
  clearRoomState: () => {
    localStorage.removeItem('persistedRoomState');
    localStorage.removeItem('roomId');
    localStorage.removeItem('roomCode');
    localStorage.removeItem('isHost');
    localStorage.removeItem('user');
  },

  // 쿠키에서 토큰 가져오기 함수
  getAuthToken: () => {
    // 1. 먼저 쿠키에서 확인
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('auth_token=')) {
        return cookie.substring('auth_token='.length);
      }
    }
    
    // 2. 쿠키에 없으면 로컬 스토리지에서 가져옴
    return localStorage.getItem('token');
  }
};

export const WebSocketStateRecovery = {
  // 웹소켓 상태 복구 시도
  recoverWebSocketState: async (
    stompClient: any, 
    user: any, 
    roomId: string | null,
    navigate: NavigateFunction
  ): Promise<boolean> => {
    try {
      // 1. 저장된 상태 확인
      const persistedState = RoomStateManager.restoreRoomState();
      
      if (!persistedState || !persistedState.roomId) {
        console.log('복구할 상태가 없습니다.');
        return false;
      }

      // 토큰 확인
      const token = RoomStateManager.getAuthToken();
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        navigate('/');
        return false;
      }

      // 2. 웹소켓 재연결
      if (!stompClient || !stompClient.connected) {
        console.log('웹소켓 재연결 시도');
        await WebSocketStateRecovery.reconnectWebSocket(stompClient, user, persistedState.roomId);
      }

      // 3. 방 정보 동기화 요청
      await WebSocketStateRecovery.requestRoomSync(stompClient, user, persistedState.roomId);

      return true;
    } catch (error) {
      console.error('웹소켓 상태 복구 실패:', error);
      navigate('/');
      return false;
    }
  },

  // 웹소켓 재연결 함수
  reconnectWebSocket: async (
    stompClient: any, 
    user: any, 
    roomId: string
  ) => {
    if (!stompClient) return;

    try {
      // 소켓 활성화 및 연결
      if (!stompClient.connected) {
        await stompClient.activate();
      }

      // 필요한 채널 구독 재설정 (기존 컴포넌트의 구독 로직 참고)
      // 예시 (실제 구현은 기존 useUserWebSocket 훅 참고):
      // stompClient.subscribe(`/topic/room/${roomId}`);
      // stompClient.subscribe(`/topic/room/${roomId}/chat`);
      // stompClient.subscribe(`/topic/room.wait/${roomId}`);
    } catch (error) {
      console.error('웹소켓 재연결 실패:', error);
      throw error;
    }
  },

  // 방 정보 동기화 요청 함수
  requestRoomSync: async (
    stompClient: any, 
    user: any, 
    roomId: string
  ) => {
    if (!stompClient || !stompClient.connected) return;

    try {
      // 방 동기화 요청 메시지 전송 (실제 엔드포인트는 백엔드와 협의 필요)
      stompClient.publish({
        destination: `/app/room/${roomId}/sync`,
        body: JSON.stringify({
          memberId: user.memberId,
          roomId: roomId
        })
      });
    } catch (error) {
      console.error('방 동기화 요청 실패:', error);
      throw error;
    }
  }
};