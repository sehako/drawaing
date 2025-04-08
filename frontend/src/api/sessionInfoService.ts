import { Client } from '@stomp/stompjs';

// 세션 정보 데이터 인터페이스
export interface SessionData {
  word?: string[];
  drawOrder?: number[];
  [key: string]: any;
}

// 수신된 메시지를 저장할 리스트
export const receivedMessages: SessionData[] = [];

/**
 * 세션 정보를 관리하는 서비스
 */
const sessionInfoService = {
  /**
   * 수신된 메시지 리스트 가져오기
   */
  getReceivedMessages(): SessionData[] {
    return receivedMessages;
  },

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
    // STOMP 클라이언트 생성
    const client = new Client({
      brokerURL: `wss://www.drawaing.site/service/game/drawing`,
      connectHeaders: {
        roomId,
        sessionId
      },
      debug: function(str) {
        console.log('STOMP DEBUG:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });
    
    client.onConnect = (frame) => {
      console.log('STOMP 연결 상태:', client.connected);
      console.log('STOMP 세션 정보 서비스 연결 성공:', frame);
      
      // 정확한 세션 정보 토픽 구독
      const topic = `/topic/session.info/${roomId}/${sessionId}`;
      console.log(`구독 시작: ${topic}`);
      
      const subscription = client.subscribe(topic, (message) => {
        console.group('🔄 메시지 수신 시도');
        console.log('메시지 수신 시간:', new Date().toISOString());
        console.log('메시지 객체 타입:', typeof message);
        console.log('메시지 객체:', message);
        
        // 메시지 속성 확인
        const messageProps = Object.keys(message);
        console.log('메시지 속성 목록:', messageProps);
        
        // body 속성 확인
        if (message.body !== undefined) {
          console.log('메시지 body 속성 타입:', typeof message.body);
          console.log('메시지 body 값:', message.body);
          
          try {
            // 빈 body 확인
            if (!message.body || message.body.trim() === '') {
              console.log('메시지 body가 비어있음');
              console.groupEnd();
              return;
            }
            
            // JSON 파싱 시도
            const data = JSON.parse(message.body);
            console.log('파싱 성공! 데이터:', data);
            
            // 데이터 구조 확인
            console.log('데이터 타입:', typeof data);
            console.log('데이터 키:', Object.keys(data));
            
            // word 속성 확인
            if (data.word !== undefined) {
              console.log('word 속성 타입:', typeof data.word);
              console.log('word 배열 여부:', Array.isArray(data.word));
              console.log('word 값:', data.word);
              
              if (Array.isArray(data.word)) {
                console.log('word 배열 길이:', data.word.length);
              }
            } else {
              console.log('word 속성이 없음');
            }
            
            // drawOrder 속성 확인
            if (data.drawOrder !== undefined) {
              console.log('drawOrder 속성 타입:', typeof data.drawOrder);
              console.log('drawOrder 배열 여부:', Array.isArray(data.drawOrder));
              console.log('drawOrder 값:', data.drawOrder);
              
              if (Array.isArray(data.drawOrder)) {
                console.log('drawOrder 배열 길이:', data.drawOrder.length);
              }
            } else {
              console.log('drawOrder 속성이 없음');
            }
            
            // 콜백 함수로 데이터 전달
            console.log('콜백 함수 호출 시도');
            callback(data);
            console.log('콜백 함수 호출 완료');
            
          } catch (error) {
            console.error('메시지 파싱 또는 처리 오류:', error);
            
            // 원본 메시지 로깅
            console.log('원본 메시지 내용:', message.body);
            
            // JSON 형식이 아닌 경우 추가 확인
            try {
              // 텍스트 메시지일 수 있음
              console.log('텍스트 메시지로 처리 시도');
              callback({ textMessage: message.body });
            } catch (secondError) {
              console.error('텍스트 메시지 처리도 실패:', secondError);
            }
          }
        } else {
          console.log('메시지에 body 속성이 없음');
        }
        
        console.groupEnd();
      });
      
      console.log(`${topic} 구독 완료, 구독 ID:`, subscription.id);
      
      console.log(`${topic} 구독 완료`);
    };
    
    client.onStompError = (frame) => {
      console.error('STOMP 오류:', frame);
    };
    
    client.onWebSocketClose = (event) => {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
    };
    
    client.onWebSocketError = (error) => {
      console.error('WebSocket 오류:', error);
    };
    
    // 연결 시작
    client.activate();
    console.log('STOMP 세션 정보 서비스 연결 시도...');
    
    // 구독 해제 함수 반환
    return () => {
      if (client.connected) {
        client.deactivate();
        console.log('STOMP 세션 정보 서비스 연결 해제');
      }
    };
  }
};

export default sessionInfoService;