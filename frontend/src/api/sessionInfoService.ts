import { Client } from '@stomp/stompjs';

// 세션 정보 데이터 인터페이스
export interface SessionData {
  word?: string[];
  drawOrder?: number[];
  [key: string]: any;
}

// 수신된 메시지를 저장할 리스트
export const receivedMessages: SessionData[] = [];

<<<<<<< HEAD
  private constructor() {
    // 싱글톤 패턴
  }

  static getInstance(): SessionInfoService {
    if (!SessionInfoService.instance) {
      SessionInfoService.instance = new SessionInfoService();
    }
    return SessionInfoService.instance;
  }

  async initializeClient(roomId: string, sessionId: string): Promise<void> {
    if (this.stompClient && this.stompClient.connected) {
      console.log('STOMP 클라이언트가 이미 연결되어 있습니다.');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // STOMP 클라이언트 설정 (SockJS 없이 직접 WebSocket 사용)
        this.stompClient = new Client({
          // WebSocket 엔드포인트 URL (ws:// 또는 wss://)
          brokerURL: `${API_URL.replace('http://', 'ws://').replace('https://', 'wss://')}/ws`,
          
          // 디버그 로깅
          debug: (str) => {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[STOMP DEBUG]', str);
            }
          },
          
          // 추가 설정
          reconnectDelay: 5000,
          heartbeatIncoming: 30000,
          heartbeatOutgoing: 30000,
          
          // 필요한 헤더가 있으면 추가
          connectHeaders: {
            roomId,
            sessionId
          }
        });

        // 연결 설정
        this.stompClient.onConnect = () => {
          console.log('STOMP 클라이언트 연결됨');
          resolve();
        };

        this.stompClient.onStompError = (frame) => {
          console.error('STOMP 오류:', frame);
          reject(new Error(`STOMP 오류: ${frame.headers.message}`));
        };

        // 연결 시작
        this.stompClient.activate();
      } catch (error) {
        console.error('STOMP 클라이언트 초기화 오류:', error);
        reject(error);
      }
    });
  }
=======
/**
 * 세션 정보를 관리하는 서비스
 */
const sessionInfoService = {
  // 활성 STOMP 클라이언트 인스턴스 저장
  activeClient: null as Client | null,
  
  // 현재 구독 중인 토픽 추적
  activeSubscription: null as { roomId: string, sessionId: string } | null,
  
  /**
   * 수신된 메시지 리스트 가져오기
   */
  getReceivedMessages(): SessionData[] {
    return receivedMessages;
  },
>>>>>>> ad83c2a2b37703b3155fbba18820b6062df4c41f

  /**
   * 세션 정보 구독
   * @param roomId 방 ID
   * @param sessionId 세션 ID
   * @param callback 세션 정보 콜백
   * @returns 구독 해제 함수
   */
  subscribeToSessionInfo(
    roomId: string, 
    sessionId: string, 
    callback: (data: SessionData) => void
  ): () => void {
    // console.group('🔍 세션 정보 서비스 - 구독 시도');
    // console.log('구독 파라미터:', { roomId, sessionId });
    
    // 기존 연결 처리
    if (this.activeClient && this.activeClient.connected) {
      this.activeClient.deactivate();
      this.activeClient = null;
      this.activeSubscription = null;
    }
    
    // console.log(`새 STOMP 연결 생성: ${roomId}/${sessionId}`);
    
    // STOMP 클라이언트 생성
    const client = new Client({
      brokerURL: `wss://www.drawaing.site/service/game/drawing`,
      connectHeaders: {
        roomId,
        sessionId
      },
      debug: (str) => {
        // console.log('STOMP DEBUG:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });
    
    // 활성 클라이언트 및 구독 정보 업데이트
    this.activeClient = client;
    this.activeSubscription = { roomId, sessionId };
    
    client.onConnect = (frame) => {
      // console.log('STOMP 연결 상태:', client.connected);
      // console.log('STOMP 세션 정보 서비스 연결 성공:', frame);
      
      // 정확한 세션 정보 토픽 구독
      const topic = `/topic/session.info/${roomId}/${sessionId}`;
      // console.log(`구독 시작: ${topic}`);
      
      const subscription = client.subscribe(topic, (message) => {
        // console.group('🔄 메시지 수신');
        try {
          // console.log('원본 메시지:', message);
          // console.log('메시지 body:', message.body);

          // body가 문자열인지 확인
          if (typeof message.body === 'string') {
            const data = JSON.parse(message.body);
            // console.log('파싱된 데이터:', data);

            // 특정 필드 존재 여부 확인
            if (data.word && Array.isArray(data.word) && data.drawOrder && Array.isArray(data.drawOrder)) {
              // console.log('✅ 유효한 세션 데이터');
              callback(data);
            } else {
              // console.warn('❌ 데이터 형식 불일치:', data);
            }
          } else {
            // console.warn('❌ body가 문자열이 아닙니다.');
          }
        } catch (error) {
          // console.error('❌ 메시지 처리 중 오류:', error);
        }
        // console.groupEnd();
      });
      
      // console.log(`${topic} 구독 완료, 구독 ID:`, subscription.id);
    };
    
    client.onStompError = (frame) => {
      // console.error('STOMP 오류:', frame);
    };
    
    client.onWebSocketClose = (event) => {
      // console.log('WebSocket 연결 종료:', event.code, event.reason);
      if (this.activeClient === client) {
        this.activeClient = null;
        this.activeSubscription = null;
      }
    };
    
    client.onWebSocketError = (error) => {
      // console.error('WebSocket 오류:', error);
    };
    
    // 연결 시작
    client.activate();
    // console.log('STOMP 세션 정보 서비스 연결 시도...');
    
    // 구독 해제 함수 반환
    return () => {
      if (client.connected) {
        client.deactivate();
        
        if (this.activeClient === client) {
          this.activeClient = null;
          this.activeSubscription = null;
        }
        
        console.log('STOMP 세션 정보 서비스 연결 해제');
      }
    };
    
    // console.groupEnd();
  },

  /**
   * 세션 정보 처리를 위한 유틸리티 메서드
   * @param data 수신된 세션 데이터
   * @param callbacks 상태 업데이트를 위한 콜백 함수들
   */
  processSessionData(
    data: SessionData, 
    callbacks: {
      setSessionInfoData?: (data: SessionData) => void;
      setWordList?: (words: string[]) => void;
      setQuizWord?: (word: string) => void;
      setDrawOrder?: (order: number[]) => void;
      currentRound?: number;
      wordListIndexRef?: React.MutableRefObject<number>; 
    }
  ) {
    // console.log('세션 데이터 수신됨:', data);
    
    if (data.word && Array.isArray(data.word) && callbacks.setWordList) {
      console.log('단어 목록 수신:', data.word);
      
      callbacks.setWordList(data.word);
      
      if (data.word.length > 0 && callbacks.setQuizWord && 
          callbacks.currentRound !== undefined) {
        
        // 라운드 번호에 맞춰 정확히 인덱스 계산 
        // 1라운드 -> 0, 2라운드 -> 1, 3라운드 -> 2
        const roundIndex = callbacks.currentRound - 1;
        
        if (roundIndex >= 0 && roundIndex < data.word.length) {
          const selectedWord = data.word[roundIndex];
          // console.log(`라운드 ${callbacks.currentRound}의 선택된 단어:`, selectedWord);
          
          callbacks.setQuizWord(selectedWord);
        } else {
          // console.warn(`유효하지 않은 라운드 인덱스: ${roundIndex}`);
        }
      }
    }
    
    // 그리기 순서 처리
    if (data.drawOrder && Array.isArray(data.drawOrder) && callbacks.setDrawOrder) {
      // console.log('그리기 순서 수신:', data.drawOrder);
      
      // 그리기 순서 상태 업데이트
      callbacks.setDrawOrder(data.drawOrder);
      
      // 현재 그리기 순서 처리 로직
      if (data.drawOrder.length > 0) {
        // console.log('첫 번째 그리기 순서:', data.drawOrder[0]);
      }
    }
  }
};

export default sessionInfoService;