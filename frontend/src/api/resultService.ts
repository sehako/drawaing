import { Client } from '@stomp/stompjs';

let stompClient: Client | null = null;

const resultService = {
  initializeClient: async (roomId: string, sessionId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.group('🔌 결과 구독 서비스 초기화');
        console.log('방 ID:', roomId);
        console.log('세션 ID:', sessionId);
        
        // 이미 연결되어 있으면 재사용
        if (stompClient && stompClient.connected) {
          console.log('이미 연결된 STOMP 클라이언트 재사용');
          resolve();
          console.groupEnd();
          return;
        }

        // 새 연결 생성
        console.log('새 STOMP 클라이언트 생성 중...');
        stompClient = new Client({
          brokerURL: `wss://www.drawaing.site/service/game/drawing`,
          debug: (str) => {
            console.log(`STOMP: ${str}`);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
          console.log('✅ 결과 서비스 STOMP 연결 성공');
          console.groupEnd();
          resolve();
        };

        stompClient.onStompError = (frame) => {
          console.error('❌ STOMP 에러:', frame.headers['message'], frame.body);
          console.groupEnd();
          reject(new Error(`STOMP 에러: ${frame.headers['message']}`));
        };

        stompClient.activate();
      } catch (error) {
        console.error('❌ STOMP 클라이언트 초기화 오류:', error);
        console.groupEnd();
        reject(error);
      }
    });
  },

  // 결과 데이터 구독 함수
  subscribeToResults: (
    roomId: string, 
    sessionId: string, 
    callback: (data: any) => void
  ): (() => void) => {
    console.group('📡 결과 데이터 구독');
    console.log('방 ID:', roomId);
    console.log('세션 ID:', sessionId);
    
    if (!stompClient || !stompClient.connected) {
      console.error('❌ STOMP 클라이언트가 연결되지 않았습니다');
      console.groupEnd();
      return () => {};
    }

    try {
      const destination = `/topic/session.result/${roomId}/${sessionId}`;
      console.log('구독 대상 경로:', destination);
      
      const subscription = stompClient.subscribe(destination, (message) => {
        try {
          console.group('📥 결과 데이터 수신');
          console.log('원본 메시지:', message.body);
          
          const data = JSON.parse(message.body);
          console.log('파싱된 데이터:', data);
          
          // 데이터 필드별 출력
          if (typeof data === 'object' && data !== null) {
            console.log('🔍 데이터 필드 분석:');
            Object.entries(data).forEach(([key, value]) => {
              console.log(`${key}:`, value);
            });
          }
          
          callback(data);
          console.groupEnd();
        } catch (error) {
          console.error('❌ 메시지 파싱 오류:', error);
          console.groupEnd();
        }
      });

      console.log('✅ 결과 데이터 구독 성공');
      console.groupEnd();
      
      // 구독 해제 함수 반환
      return () => {
        console.log(`🔌 ${destination} 구독 해제`);
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ 결과 데이터 구독 오류:', error);
      console.groupEnd();
      return () => {};
    }
  },

  disconnect: () => {
    console.log('🔌 STOMP 클라이언트 연결 종료 시도');
    if (stompClient && stompClient.connected) {
      stompClient.deactivate();
      console.log('✅ STOMP 클라이언트 연결 종료 완료');
    } else {
      console.log('ℹ️ 연결된 STOMP 클라이언트가 없음');
    }
    stompClient = null;
  }
};

export default resultService;