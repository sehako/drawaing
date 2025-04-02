import { Client } from '@stomp/stompjs';
import { getAuthToken } from './authUtils';

// 플레이어 타입 정의
export interface Player {
  id: string;
  memberId?: number;
  nickname: string;
  isReady: boolean;
  isHost: boolean;
  character?: string;
  characterUrl?: string;
}

// 웹소켓 메시지 타입 정의
export interface JoinRoomRequest {
  memberId: number;
  nickname: string;
  characterUrl: string;
}

// 게임 시작 메시지 타입 정의 (추가됨)
export interface GameStartMessage {
  startTime: string;  // ISO 시간 문자열 형식 (예: "2025-04-01T13:29:44.189Z")
}

// 웹소켓 클라이언트 생성
// 웹소켓 클라이언트 생성 - roomId 파라미터 추가
export const createStompClient = (roomId?: string): Client => {
  // 연결 헤더 준비 (기존 설정 유지하고 roomId 추가)
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getAuthToken()}`
  };
  
  // roomId가 있으면 헤더에 추가
  if (roomId) {
    headers['roomId'] = roomId;
  }

  return new Client({
    brokerURL: 'wss://www.drawaing.site/service/game/drawing',
    connectHeaders: headers,
    debug: (str) => {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000, // 유지하기 위해서
    heartbeatOutgoing: 10000,
  });
};

// 방 참가 메시지 전송
export const sendJoinRoomMessage = (
  client: Client, 
  userInfo: JoinRoomRequest, 
  roomId: string
): void => {
  const destination = `/app/room.join/${roomId}`;
  const message = {
    memberId: userInfo.memberId,
    nickname: userInfo.nickname,
    characterUrl: userInfo.characterUrl
  };

  console.log(`방 참가 요청 전송: ${destination}`, JSON.stringify(message));
  
  // 연결 상태 확인 후 메시지 전송
  if (client && client.connected) {
    try {
      client.publish({
        destination: destination,
        body: JSON.stringify(message),
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('방 참가 메시지 전송 오류:', error);
    }
  } else {
    console.warn('웹소켓이 연결되지 않았습니다. 방 참가 요청을 보낼 수 없습니다.');
  }
};

// 준비 상태 변경 메시지 전송
export const sendReadyStatusMessage = (
  client: Client, 
  memberId: number, 
  isReady: boolean, 
  roomId: string
): void => {
  client.publish({
    destination: `/app/room.ready/${roomId}`,
    body: JSON.stringify({
      memberId: memberId,
      isReady: isReady
    }),
    headers: { 
      'content-type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
};

// 게임 시작 메시지 전송 (수정됨)
export const sendGameStartMessage = (
  client: Client, 
  memberId: number, 
  roomId: string
): void => {
  // 현재 시간에서 3초 후를 시작 시간으로 설정
  const startTime = new Date(Date.now() + 3000).toISOString();
  
  // 시작 시간 정보를 포함한 메시지 생성
  const message = {
    memberId: memberId,
    startTime: startTime  // 시작 시간 추가
  };
  
  console.log(`게임 시작 메시지 전송 (시작 시간: ${startTime}):`, JSON.stringify(message));
  
  // 연결 상태 확인 후 메시지 전송
  if (client && client.connected) {
    try {
      client.publish({
        destination: `/app/room.start/${roomId}`,
        body: JSON.stringify(message),
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('게임 시작 메시지 전송 오류:', error);
    }
  } else {
    console.warn('웹소켓이 연결되지 않았습니다. 게임 시작 요청을 보낼 수 없습니다.');
  }
};

// 방 나가기 메시지 전송
export const sendLeaveRoomMessage = (
  client: Client, 
  memberId: number, 
  nickname: string,
  characterUrl: string,
  roomId: string
): void => {
  client.publish({
    destination: `/app/room.leave/${roomId}`,
    body: JSON.stringify({
      memberId: memberId,
      nick: nickname,
      characterUrl: characterUrl || "https://example.com/default-character.png"
    }),
    headers: { 
      'content-type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}` 
    }
  });
};

// 플레이어 데이터 정규화 함수
export const normalizePlayerData = (playerData: any): { normalizedData: any, hostId: number | null } => {
  // 데이터 형식 확인 및 정규화
  let normalizedData;
  let hostId = null;
  
  // 새로운 형식 확인 (hostId 포함)
  if (playerData.hostId !== undefined) {
    console.log('hostId 필드 감지:', playerData.hostId);
    hostId = playerData.hostId;
  }
  
  // participants 객체가 있는지 확인
  if (playerData.participants) {
    console.log('participants 객체 감지');
    normalizedData = playerData.participants;
  } 
  // 타입과 페이로드 형식 확인
  else if (playerData.type && playerData.payload) {
    console.log('타입-페이로드 형식 감지:', playerData.type);
    
    // payload에 hostId가 있는지 확인
    if (playerData.payload.hostId !== undefined && hostId === null) {
      hostId = playerData.payload.hostId;
    }
    
    // payload 안에 participants가 있는지 확인
    if (playerData.payload.participants) {
      normalizedData = playerData.payload.participants;
    } else {
      normalizedData = playerData.payload;
    }
  }
  // 그 외 경우는 원본 데이터 사용
  else {
    normalizedData = playerData;
  }
  
  return { normalizedData, hostId };
};

// 방장 ID 결정 함수 (hostId가 있으면 사용, 없으면 첫 번째 플레이어)
export const determineHostId = (playerIds: string[], serverHostId: number | null): string | null => {
  if (playerIds.length === 0) return null;
  
  // 서버에서 hostId가 제공되면 해당 ID 사용
  if (serverHostId !== null) {
    const hostIdStr = serverHostId.toString();
    // playerIds에 serverHostId가 있는지 확인
    if (playerIds.includes(hostIdStr)) {
      return hostIdStr;
    }
  }
  
  // hostId가 없거나 playerIds에 없는 경우 첫 번째 플레이어를 방장으로 사용 (기존 로직)
  return playerIds[0];
};