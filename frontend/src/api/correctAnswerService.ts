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
          heartbeatIncoming: 30000,
          heartbeatOutgoing: 30000,
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
    drawingOrder: number,
    callback?: (roundResult: { isWin: boolean, round: number }) => void
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
      
      // 라운드 결과 구독 설정 (콜백이 제공된 경우)
      if (callback) {
        const roundResultDestination = `/topic/session.info/${roomId}/${sessionId}`;
        console.log('🔍 세션 정보 구독 경로:', roundResultDestination);
        
        const subscription = stompClient.subscribe(
          roundResultDestination, 
          (message) => {
            console.log('📬 전체 수신 메시지:', message);
            console.log('📬 메시지 본문:', message.body);
  
            try {
              const sessionInfo = JSON.parse(message.body);
              console.log('🎲 세션 정보 수신:', sessionInfo);
              
              // roundResult 형식으로 변환
              if (sessionInfo && sessionInfo.roundResult) {
                const roundResult = {
                  isWin: sessionInfo.roundResult.isWin,
                  round: sessionInfo.roundResult.round
                };
  
                callback(roundResult);
              } else {
                console.error('❌ 라운드 결과 데이터를 찾을 수 없음:', sessionInfo);
              }
              
              // 한 번 콜백 호출 후 구독 취소
              subscription.unsubscribe();
            } catch (error) {
              console.error('❌ 세션 정보 파싱 오류:', error);
            }
          }
        );
      }
      
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

  subscribeToRoundResult: (
    roomId: string, 
    sessionId: string, 
    callback: (roundResult: { isWin: boolean, round: number }) => void
  ): (() => void) => {
    console.group('🔔 라운드 결과 구독');
    
    if (!stompClient || !stompClient.connected) {
      console.error('❌ STOMP 클라이언트가 연결되지 않았습니다');
      console.groupEnd();
      throw new Error('STOMP 클라이언트가 연결되지 않았습니다');
    }
  
    const destination = `/topic/session.round-result/${roomId}/${sessionId}`;
    
    const subscription = stompClient.subscribe(destination, (message) => {
      console.log('📬 전체 수신 메시지:', message);
      console.log('📬 메시지 본문 (원시):', message.body);
  
      try {
        // JSON 파싱 전 원시 데이터 확인
        const rawData = message.body;
        console.log('📝 원시 JSON 문자열:', rawData);
  
        const roundResult = JSON.parse(rawData);
        console.log('🎲 파싱된 라운드 결과:', roundResult);
  
        // 데이터 구조 상세 검증
        console.log('🔍 데이터 타입 검증:');
        console.log('전체 수신 객체:', roundResult);
        console.log('Object.keys:', Object.keys(roundResult));
        
        // 가능한 모든 키 출력
        for (const key in roundResult) {
          console.log(`${key}: ${roundResult[key]} (타입: ${typeof roundResult[key]})`);
        }
  
        // 정확한 형식 검증 및 유연한 처리
        const processedResult = {
          isWin: roundResult.isWin ?? roundResult.win ?? false,
          round: roundResult.round ?? roundResult.currentRound ?? 0
        };
  
        console.log('✅ 처리된 라운드 결과:', processedResult);
        
        // 콜백 호출
        callback(processedResult);
      } catch (error) {
        console.error('❌ 라운드 결과 파싱 오류:', error);
      }
    });
  
    console.log('✅ 라운드 결과 구독 성공:', destination);
    console.groupEnd();
  
    // 구독 취소 함수 반환
    return () => {
      console.log('🚫 라운드 결과 구독 취소');
      subscription.unsubscribe();
    };
  },
  // 라운드 결과 전송 메서드 추가
  sendRoundResult: (
    roomId: string,
    sessionId: string,
    roundResultData: {
      drawingMemberId: number,
      answerMemberId: number,
      drawingOrder: number,
      isCorrect: boolean,
      roundScore?: number
    }
  ): boolean => {
    console.group('🏁 라운드 결과 메시지 전송');
    console.log('방 ID:', roomId);
    console.log('세션 ID:', sessionId);
    
    if (!stompClient || !stompClient.connected) {
      console.error('❌ STOMP 클라이언트가 연결되지 않았습니다');
      console.groupEnd();
      return false;
    }

    try { 
      const destination = `/app/session.round-result/${roomId}/${sessionId}`;
      const payload = roundResultData;

      console.log('전송 대상 경로:', destination);
      console.log('📦 전송 데이터: ', JSON.stringify(payload, null, 2));
      
      stompClient.publish({
        destination,
        body: JSON.stringify(payload)
      });

      console.log('✅ 라운드 결과 메시지 전송 성공');
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ 라운드 결과 메시지 전송 오류:', error);
      console.groupEnd();
      return false;
    }
  },

  sendAIWinSignal: (
    roomId: string,
    sessionId: string
  ): boolean => {
    console.group('🤖 AI 승리 신호 전송');
    console.log('방 ID:', roomId);
    console.log('세션 ID:', sessionId);
    
    if (!stompClient || !stompClient.connected) {
      console.error('❌ STOMP 클라이언트가 연결되지 않았습니다');
      console.groupEnd();
      return false;
    }
  
    try { 
      const destination = `/app/session.lose/${roomId}/${sessionId}`;
      const payload = 1; // true 값 전송
  
      console.log('전송 대상 경로:', destination);
      console.log('📦 전송 데이터: ', payload);
      
      stompClient.publish({
        destination,
        body: JSON.stringify(payload)
      });
  
      console.log('✅ AI 승리 신호 전송 성공');
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ AI 승리 신호 전송 오류:', error);
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