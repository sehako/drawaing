// src/api/sessionResultService.ts
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

// 결과 데이터 인터페이스 정의
export interface SessionResultData {
  [memberId: string]: {
    winCnt: number;
    point: number;
    score: number;
    exp: number;
  }
}

// 처리된 결과 데이터 인터페이스
interface ProcessedResultData {
  players: Array<{
    memberId: number;
    winCount: number;
    points: number;
    score: number;
    exp: number;
  }>;
  totalWins: number;
  totalPoints: number;
  totalScore: number;
  totalExp: number;
}

// 결과 콜백 함수 타입
type ResultCallback = (data: SessionResultData) => void;

// stompClient에 Client 타입 지정
let stompClient: Client | null = null;

/**
 * STOMP 클라이언트 초기화
 * @param {string} roomId 방 ID
 * @param {string} sessionId 세션 ID
 * @returns {Promise<void>}
 */
const initializeClient = async (roomId: string, sessionId: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (stompClient && stompClient.connected) {
      console.log('세션 결과 서비스: STOMP 클라이언트가 이미 연결되어 있습니다.');
      resolve();
      return;
    }

    try {
      // SockJS 대신 표준 WebSocket 사용
      stompClient = new Client({
        // WebSocket URL (ws:// 또는 wss://)
        brokerURL: 'wss://www.drawaing.site/service/game/drawing',
        debug: function (str: string) {
          console.log('세션 결과 서비스 STOMP: ', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      stompClient.onConnect = () => {
        console.log(`세션 결과 서비스: STOMP 연결 성공 (roomId: ${roomId}, sessionId: ${sessionId})`);
        resolve();
      };

      stompClient.onStompError = (frame) => {
        console.error('세션 결과 서비스: STOMP 에러', frame);
        reject(new Error('STOMP 연결 중 오류가 발생했습니다.'));
      };

      stompClient.activate();
    } catch (error) {
      console.error('세션 결과 서비스: STOMP 클라이언트 초기화 실패', error);
      reject(error);
    }
  });
};

/**
 * 세션 결과 정보 구독
 * @param {string} roomId 방 ID
 * @param {string} sessionId 세션 ID
 * @param {function} callback 결과 수신 시 호출할 콜백 함수
 * @returns {function} 구독 취소 함수
 */
const subscribeToSessionResult = (roomId: string, sessionId: string, callback: ResultCallback): () => void => {
  if (!stompClient || !stompClient.connected) {
    console.warn('세션 결과 서비스: STOMP 클라이언트가 연결되어 있지 않습니다. 자동으로 연결을 시도합니다.');
    
    // 비동기로 클라이언트 초기화 및 구독
    initializeClient(roomId, sessionId)
      .then(() => {
        subscribeToSessionResultInternal(roomId, sessionId, callback);
      })
      .catch(error => {
        console.error('세션 결과 서비스: 자동 연결 및 구독 실패', error);
      });
    
    // 더미 구독 취소 함수 반환
    return () => {
      console.log('세션 결과 서비스: 구독되지 않았습니다.');
    };
  }
  
  return subscribeToSessionResultInternal(roomId, sessionId, callback);
};

/**
 * 내부 구독 함수 - 클라이언트가 이미 초기화된 경우 호출
 */
const subscribeToSessionResultInternal = (roomId: string, sessionId: string, callback: ResultCallback): () => void => {
  if (!stompClient) {
    console.error('세션 결과 서비스: STOMP 클라이언트가 없습니다.');
    return () => {};
  }

  const subscription = stompClient.subscribe(
    `/topic/session.result/${roomId}/${sessionId}`,
    (message: IMessage) => {
      try {
        console.log('세션 결과 수신:', message.body);
        const data = JSON.parse(message.body) as SessionResultData;
        callback(data);
      } catch (error) {
        console.error('세션 결과 메시지 파싱 오류:', error);
      }
    }
  );
  
  console.log(`세션 결과 서비스: 구독 성공 (roomId: ${roomId}, sessionId: ${sessionId})`);
  
  // 구독 취소 함수 반환
  return () => {
    if (subscription) {
      subscription.unsubscribe();
      console.log('세션 결과 서비스: 구독 취소됨');
    }
  };
};

/**
 * 세션 결과 데이터 처리 유틸리티 함수
 * @param {object} data 세션 결과 데이터
 * @returns {object} 정리된 결과 데이터
 */
const processSessionResultData = (data: SessionResultData | null): ProcessedResultData | null => {
  // 데이터 유효성 검사
  if (!data || typeof data !== 'object') {
    console.error('세션 결과 서비스: 유효하지 않은 데이터 형식', data);
    return null;
  }
  
  try {
    // 결과 데이터를 플레이어별로 정리
    const processedData: ProcessedResultData = {
      players: [],
      totalWins: 0,
      totalPoints: 0,
      totalScore: 0,
      totalExp: 0
    };
    
    // 각 플레이어 ID별 결과 처리
    Object.entries(data).forEach(([memberId, stats]) => {
      if (stats && typeof stats === 'object') {
        processedData.players.push({
          memberId: parseInt(memberId),
          winCount: stats.winCnt || 0,
          points: stats.point || 0,
          score: stats.score || 0,
          exp: stats.exp || 0
        });
        
        // 전체 통계 업데이트
        processedData.totalWins += stats.winCnt || 0;
        processedData.totalPoints += stats.point || 0;
        processedData.totalScore += stats.score || 0;
        processedData.totalExp += stats.exp || 0;
      }
    });
    
    return processedData;
  } catch (error) {
    console.error('세션 결과 데이터 처리 중 오류:', error);
    return null;
  }
};

// 모듈 내보내기
const sessionResultService = {
  initializeClient,
  subscribeToSessionResult,
  processSessionResultData
};

export default sessionResultService;