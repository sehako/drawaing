import { Client } from '@stomp/stompjs';

let stompClient: Client | null = null;

const correctAnswerService = {
  initializeClient: async (roomId: string, sessionId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.group('🔌 정답 서비스 초기화');
        console.log('방 ID:', roomId);
        console.log('세션 ID:', sessionId);
        
        // 이미 연결되어 있으면 재사용
        if (stompClient && stompClient.connected) {
          console.log('이미 연결된 STOMP 클라이언트 재사용');
          resolve();
          console.groupEnd();
          return;
        }

        // 새 연결 생성 - drawingService와 동일한 방식 사용
        console.log('새 STOMP 클라이언트 생성 중...');
        stompClient = new Client({
          brokerURL: `wss://www.drawaing.site/service/game/drawing`,
          debug: (str) => {
            console.log(`STOMP: ${str}`);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
        });

        stompClient.onConnect = () => {
          console.log('✅ 정답 서비스 STOMP 연결 성공');
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

  // 정답을 맞췄을 때 서버로 메시지 보내는 함수
  sendCorrectAnswer: (
    roomId: string,
    sessionId: string,
    drawingMemberId: number,
    answerMemberId: number,
    drawingOrder: number
  ): boolean => {
    console.group('🎯 정답 메시지 전송');
    console.log('방 ID:', roomId);
    console.log('세션 ID:', sessionId);
    
    if (!stompClient || !stompClient.connected) {
      console.error('❌ STOMP 클라이언트가 연결되지 않았습니다');
      console.groupEnd();
      return false;
    }

    try { 
      const destination = `/app/session.correct/${roomId}/${sessionId}`;
      const payload = {
        drawingMemberId,
        answerMemberId,
        drawingOrder
      };

      console.log('전송 대상 경로:', destination);
      console.log('📦 전송 데이터: ', JSON.stringify(payload, null, 2));
      
      stompClient.publish({
        destination,
        body: JSON.stringify(payload)
      });

      console.log('✅ 정답 메시지 전송 성공');
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ 정답 메시지 전송 오류:', error);
      console.groupEnd();
      return false;
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

export default correctAnswerService;