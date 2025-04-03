import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import { 
  createStompClient, 
  sendJoinRoomMessage, 
  JoinRoomRequest, 
  Player,
  normalizePlayerData,
  determineHostId,
  GameStartMessage // 새로 추가된 인터페이스 import
} from '../utils/GameSocketUtils';

interface UseUserWebSocketProps {
  roomId: string;
  user: {
    memberId: number;
    nickname: string;
    characterImage: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseUserWebSocketReturn {
  stompClient: Client | null;
  isConnected: boolean;
  players: Player[];
  currentUser: Player | null;
  chatMessages: string[];
  gameStartInfo: GameStartMessage | null; // 추가: 게임 시작 정보
  subscribeToRoom: (client: Client, roomId: string) => void;
  joinRoom: (client: Client, userInfo: JoinRoomRequest, roomId: string) => void;
  updatePlayersList: (playerData: any) => void;
  updatePlayerReadyStatus: (readyData: any) => void;
  addChatMessage: (chatData: any) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setChatMessages: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<Player | null>>;
  setIsLeaving: React.Dispatch<React.SetStateAction<boolean>>;
  isLeaving: boolean;
  setGameStartInfo: React.Dispatch<React.SetStateAction<GameStartMessage | null>>;
  sessionId: string | null; // 추가된 sessionId 속성
}

const useUserWebSocket = ({
  roomId,
  user,
  isAuthenticated,
  isLoading
}: UseUserWebSocketProps): UseUserWebSocketReturn => {
  const navigate = useNavigate();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [gameStartInfo, setGameStartInfo] = useState<GameStartMessage | null>(null); // 추가: 게임 시작 정보 상태
  const componentMountedRef = useRef(true);
  const [sessionId, setSessionId] = useState<string | null>(null); // 추가: sessionId 상태


  // updatePlayersList 함수 수정 - 방장 상태 더 확실하게 처리
  const updatePlayersList = useCallback((playerData: any) => {
    console.log('===== 플레이어 데이터 처리 시작 =====');
    console.log('원본 데이터:', playerData);
    
    // 데이터 형식 정규화 (hostId 정보 포함)
    const { normalizedData, hostId } = normalizePlayerData(playerData);
    console.log('정규화된 데이터:', normalizedData);
    console.log('서버 지정 방장 ID:', hostId);
    
    // 빈 객체나 유효하지 않은 형식인 경우 처리 중단
    if (!normalizedData || typeof normalizedData !== 'object' || Object.keys(normalizedData).length === 0) {
      console.warn('유효한 플레이어 데이터가 아닙니다.');
      return;
    }
    
    // 플레이어 ID 목록
    const playerIds = Object.keys(normalizedData);
    console.log('플레이어 ID 목록:', playerIds);
    
    if (playerIds.length === 0) {
      console.warn('플레이어 목록이 비어 있습니다.');
      return;
    }
    
    // 방장 ID 결정 (서버에서 제공한 hostId 사용, 없으면 첫 번째 플레이어)
    const hostPlayerId = determineHostId(playerIds, hostId);
    console.log('결정된 방장 ID:', hostPlayerId);
    
    // hostId가 있으면 localStorage에 저장
    if (hostId !== null) {
      // 현재 사용자가 방장인지 확인
      const isCurrentUserHost = user?.memberId === hostId;
      localStorage.setItem('isHost', isCurrentUserHost ? 'true' : 'false');
      console.log('방장 여부 localStorage 저장:', isCurrentUserHost);
    }
    
    // 객체를 배열로 변환하여 처리
    const updatedPlayers = Object.entries(normalizedData).map(([id, data]: [string, any]) => {
      // 방장 설정: hostId와 일치하는 플레이어를 방장으로
      const isHost = hostPlayerId ? id === hostPlayerId : false;
      
      return {
        id: id,
        memberId: parseInt(id),
        nickname: data.nickname || '알 수 없음',
        isReady: data.ready || data.isReady || false,  // 서버에서 ready 또는 isReady로 전송 가능
        isHost: isHost, // 명확하게 방장 여부 설정
        character: data.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown',
        characterUrl: data.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown'
      };
    });

    console.log('변환된 플레이어 목록:', updatedPlayers);
    
    setPlayers(updatedPlayers);

    // 현재 사용자 찾기
    if (user && user.memberId) {
      const userIdStr = user.memberId.toString();
      console.log('현재 사용자 ID:', userIdStr);
      
      // 내가 방장인지 확인
      const amIHost = hostId !== null && user.memberId === hostId;
      console.log('내가 방장인가?', amIHost);
      
      // 방장 정보 로컬 스토리지에 저장
      localStorage.setItem('isHost', amIHost ? 'true' : 'false');
      
      const myInfo = updatedPlayers.find(p => p.id === userIdStr || p.memberId === user.memberId);
      if (myInfo) {
        // 방장 상태를 명확하게 설정
        const updatedMyInfo = {...myInfo, isHost: amIHost};
        console.log('내 플레이어 정보 업데이트:', updatedMyInfo);
        setCurrentUser(updatedMyInfo);
      } else {
        // 사용자가 목록에 없으면, 기존 user 정보로 가상의 플레이어 객체 생성
        const virtualUser = {
          id: userIdStr,
          memberId: user.memberId,
          nickname: user.nickname || '게스트',
          isReady: false,
          isHost: amIHost,  // hostId에 따라 방장 여부 결정
          character: user.characterImage || 'https://placehold.co/400/gray/white?text=Unknown',
          characterUrl: user.characterImage || 'https://placehold.co/400/gray/white?text=Unknown'
        };
        console.log('목록에 내 정보가 없어 가상 정보 생성:', virtualUser);
        setCurrentUser(virtualUser);
        
        // 플레이어 목록에 자신 추가(서버 응답에 본인이 없는 경우를 대비)
        setPlayers([...updatedPlayers, virtualUser]);
      }
    }
    
    console.log('===== 플레이어 데이터 처리 완료 =====');
  }, [user]);

  // 준비 상태 업데이트 함수
  const updatePlayerReadyStatus = useCallback((readyData: any) => {
    console.log('준비 상태 변경 데이터:', readyData);
    
    // readyData 형식이 { playerId: { ready: boolean } } 형태인 경우
    if (typeof readyData === 'object' && !Array.isArray(readyData)) {
      const entries = Object.entries(readyData);
      if (entries.length > 0) {
        const [playerId, playerData] = entries[0] as [string, any];
        
        // 플레이어 목록 업데이트
        setPlayers(prev => prev.map(player => 
          player.id === playerId
            ? { ...player, isReady: playerData.ready || playerData.isReady || false }
            : player
        ));

        // 현재 사용자의 준비 상태 업데이트
        setCurrentUser(prev => 
          prev && prev.id === playerId
            ? { ...prev, isReady: playerData.ready || playerData.isReady || false }
            : prev
        );

        // 채팅에 메시지 추가
        const playerName = players.find(p => p.id === playerId)?.nickname || 'Unknown';
        const readyStatus = (playerData.ready || playerData.isReady) ? '준비 완료' : '준비 취소';
        const newMessage = `시스템: ${playerName}님이 ${readyStatus}했습니다.`;
        setChatMessages(prev => [...prev, newMessage]);
      }
    } else {
      console.error('예상치 못한 준비 상태 데이터 형식:', readyData);
    }
  }, [players]);

  // 채팅 메시지 추가 함수
  const addChatMessage = useCallback((chatData: any) => {
    const newMessage = `${chatData.nickname}: ${chatData.message}`;
    setChatMessages(prev => [...prev, newMessage]);
  }, []);

  // 웹소켓 방 구독 함수 - 게임 시작 메시지 처리 추가
  const subscribeToRoom = useCallback((client: Client, roomId: string) => {
    console.log(`방 이벤트 구독 시도: /topic/room/${roomId}`);
    
    // 방 이벤트 구독 (기존)
    client.subscribe(`/topic/room/${roomId}`, (message) => {
      try {
        console.log('방 이벤트 메시지 수신:', message);
        const data = JSON.parse(message.body);
        console.log('방 이벤트 데이터 수신:', data);
        
        // sessionId가 있는 경우 처리 (추가)
        if (data.sessionId) {
          console.log('세션 ID 발견:', data.sessionId);
          setSessionId(data.sessionId);
          localStorage.setItem('sessionId', data.sessionId);
          
          // roomId도 함께 저장
          localStorage.setItem('roomId', roomId);
        }
        
        // 타입에 따른 처리
        if (data.type === 'PLAYER_JOIN' || data.type === 'PLAYER_LIST') {
          console.log('플레이어 목록 업데이트 이벤트 감지:', data.type);
          updatePlayersList(data.payload || data);
        } else if (data.type === 'PLAYER_READY') {
          console.log('플레이어 준비 상태 변경 이벤트 감지');
          updatePlayerReadyStatus(data.payload || data);
        } else if (data.type === 'GAME_START') {
          console.error('게임 시작 이벤트 감지 (전체 데이터):', data);
          
          // payload에 startTime 필드 확인
          if (data.payload && data.payload.startTime) {
            console.error('게임 시작 시간 수신:', data.payload.startTime);
            
            // 즉시 게임 시작 정보 설정
            setGameStartInfo({ startTime: data.payload.startTime });
            
            // 모든 클라이언트에 즉시 알림
            setChatMessages(prev => [
              ...prev, 
              `시스템: 게임이 곧 시작됩니다. 준비하세요!`
            ]);
          } else {
            console.error('게임 시작 페이로드에 startTime 없음:', data.payload);
          }
        
        } else if (data.participants) {
          // participants 객체가 있는 경우 플레이어 목록 업데이트
          console.log('participants 객체 감지, 플레이어 목록 업데이트');
          updatePlayersList(data);
        } else {
          // 일반적인 플레이어 데이터로 처리
          if (data && Object.keys(data).length > 0) {
            console.log('일반 플레이어 정보 업데이트 감지');
            updatePlayersList(data);
          } else {
            console.log('알 수 없는 메시지 형식:', data);
          }
        }
      } catch (error) {
        console.error('이벤트 데이터 파싱 오류:', error);
      }
    });
    
    // 새로운 게임 시작 시간 정보 구독 (추가)
    console.log(`게임 시작 시간 구독 시도: /topic/room.wait/${roomId}`);
    client.subscribe(`/topic/room.wait/${roomId}`, (message) => {
      try {
        console.error('게임 시작 시간 메시지 수신 (FULL MESSAGE):', message);
        console.error('메시지 본문:', message.body);
        
        const data = JSON.parse(message.body);
        console.error('게임 시작 시간 데이터 수신 (전체):', data);
        
        // startTime 필드 확인
        if (data && data.startTime) {
          console.error('유효한 게임 시작 시간 수신:', data.startTime);
          
          // 게임 시작 정보 업데이트 (강제로 5초 이상 되도록)
          const startTime = new Date(data.startTime);
          const currentTime = new Date();
          const timeUntilStart = startTime.getTime() - currentTime.getTime();
          
          // 최소 5초 이상 되도록 강제 설정
          const adjustedStartTime = new Date(currentTime.getTime() + Math.max(timeUntilStart, 5000));
          
          setGameStartInfo({ startTime: adjustedStartTime.toISOString() });
          
          // 시스템 메시지 추가
          const countdownSeconds = Math.ceil((adjustedStartTime.getTime() - currentTime.getTime()) / 1000);
          
          setChatMessages(prev => [
            ...prev, 
            `시스템: 게임이 ${countdownSeconds}초 후에 시작됩니다. 준비하세요!`
          ]);
        } else {
          console.error('게임 시작 시간이 없거나 유효하지 않음:', data);
        }
      } catch (error) {
        console.error('게임 시작 메시지 파싱 오류:', error);
      }
    });
    
    // 채팅 메시지 구독 (기존)
    client.subscribe(`/topic/room/${roomId}/chat`, (message) => {
      try {
        console.log('채팅 메시지 수신:', message);
        const data = JSON.parse(message.body);
        
        if (data && data.nickname && data.message) {
          addChatMessage(data);
        }
      } catch (error) {
        console.error('채팅 메시지 파싱 오류:', error);
      }
    });
    
    console.log('모든 구독 완료');
  }, [updatePlayersList, updatePlayerReadyStatus, addChatMessage]);

  // 게임 시작 시간 정보에 따라 게임 화면으로 이동
  useEffect(() => {
    if (!gameStartInfo || !roomId) return;
    
    console.log('게임 시작 정보 감지:', gameStartInfo);
    
    // ISO 시간 문자열을 Date 객체로 변환
    const startTime = new Date(gameStartInfo.startTime);
    const currentTime = new Date();
    
    // 시작 시간과 현재 시간 차이 계산 (밀리초)
    const timeUntilStart = startTime.getTime() - currentTime.getTime();
    
    console.log(`게임 시작까지 ${timeUntilStart}ms 남음`);
    
    if (timeUntilStart <= 0) {
      // 이미 시작 시간이 지났거나 현재 시간인 경우 즉시 이동
      console.log('시작 시간이 이미 지났거나 현재임 - 즉시 게임 화면으로 이동');
      navigate(`/game/${roomId}`);
      return;
    }
    
    // 시작 시간에 맞춰 게임 화면으로 이동하는 타이머 설정
    console.log(`${timeUntilStart}ms 후에 게임 화면으로 이동 예정`);
    const startGameTimer = setTimeout(() => {
      console.log('게임 시작 시간이 되었습니다 - 게임 화면으로 이동');
      navigate(`/game/${roomId}`);
    }, timeUntilStart);
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearTimeout(startGameTimer);
    };
  }, [gameStartInfo, roomId, navigate]);

  // joinRoom 함수
  const joinRoom = useCallback((client: Client, userInfo: JoinRoomRequest, roomId: string) => {
    console.log('방 참가 시도 - 사용자 정보:', userInfo, '방 ID:', roomId);
    
    if (!client.connected) {
      console.warn('웹소켓이 연결되지 않았습니다. 연결 후 다시 시도합니다.');
      return;
    }
    
    sendJoinRoomMessage(client, userInfo, roomId);
    
    // 방에 참가한 직후 자기 자신을 플레이어 목록에 추가
    const selfPlayer: Player = {
      id: userInfo.memberId.toString(),
      memberId: userInfo.memberId,
      nickname: userInfo.nickname || '게스트',
      isReady: false,
      // 방을 처음 만든 사람은 방장으로 설정
      isHost: players.length === 0,
      character: userInfo.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown',
      characterUrl: userInfo.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown'
    };
    
    // 자신이 플레이어 목록에 없는 경우에만 추가
    setPlayers(prev => {
      const exists = prev.some(p => p.id === selfPlayer.id);
      if (!exists) {
        console.log('내 정보를 플레이어 목록에 추가:', selfPlayer);
        return [...prev, selfPlayer];
      }
      return prev;
    });
    
    // 현재 사용자 정보 설정
    setCurrentUser(selfPlayer);
    
    // 확인 및 재시도 로직
    const checkRoomStatus = () => {
      // 나가는 중이거나 연결이 끊겼으면 시도하지 않음
      if (isLeaving || !client.connected) return;
      
      if (players.length === 0) {
        console.log('플레이어 목록이 비어 있습니다. 재시도합니다.');
        
        // 안전하게 방 참가 메시지 재전송
        if (client.connected) {
          // 방 참가 메시지 재전송
          sendJoinRoomMessage(client, userInfo, roomId);
          
          // 여전히 플레이어 목록이 비어있다면 자기 자신을 다시 추가
          setPlayers(prev => {
            if (prev.length === 0) {
              return [selfPlayer];
            }
            return prev;
          });
        }
      } else {
        console.log('방 참가 성공. 현재 플레이어:', players);
        
        // 플레이어 목록에 자신이 없는지 확인하고 추가
        const iAmInList = players.some(p => p.id === selfPlayer.id);
        if (!iAmInList) {
          console.log('플레이어 목록에 내가 없어서 추가합니다');
          setPlayers(prev => [...prev, selfPlayer]);
        }
      }
    };
    
    // 3초 후 상태 확인
    setTimeout(checkRoomStatus, 3000);
  }, [players, isLeaving]);

  // 웹소켓 연결 설정 효과
  useEffect(() => {
    if (isLoading || !roomId) return; // 로딩 중이거나 roomId가 없으면 실행하지 않음
    
    console.log('웹소켓 연결 시도 - 실제 roomId:', roomId);
    
    // 로그인 상태 다시 확인
    if (!isAuthenticated || !user) {
      console.error('로그인되지 않았습니다. 게임에 참가하려면 로그인이 필요합니다.');
      navigate('/');
      return;
    }

    // 사용자 정보 가져오기
    const userInfo = {
      memberId: user.memberId || 0,
      nickname: user.nickname || '게스트',
      characterUrl: user.characterImage || 'default_character'
    };

    console.log('웹소켓 연결 시도 - 사용자 정보:', userInfo);

    // 기존 연결이 있다면 해제
    let newClient: Client | null = null;
    
    try {
      // 웹소켓 클라이언트 생성
      newClient = createStompClient();

      // 연결 성공 시 콜백
      newClient.onConnect = () => {
        setIsConnected(true);
        console.log('WebSocket 연결 성공!');

        // 해당 방의 이벤트를 먼저 구독
        subscribeToRoom(newClient!, roomId);
        
        // 약간의 지연 후 방 참가 요청 (구독 설정이 완료된 후)
        setTimeout(() => {
          // 방 참가 요청
          joinRoom(newClient!, userInfo, roomId);
          console.log('접속 확인 - 방 ID:', roomId);
        }, 500);
      };

      // 연결 에러 시 콜백
      newClient.onStompError = (frame) => {
        console.error('WebSocket 연결 오류:', frame);
        setIsConnected(false);
      };

      // 연결 끊김 콜백
      newClient.onDisconnect = () => {
        console.log('WebSocket 연결 끊김');
        setIsConnected(false);
        
        if (!isLeaving && componentMountedRef.current) {
          // 연결 재시도 (3초 후)
          setTimeout(() => {
            if (newClient && !newClient.active && !isLeaving && componentMountedRef.current) {
              console.log('WebSocket 연결 재시도...');
              try {
                newClient.activate();
              } catch (error) {
                console.error('WebSocket 재연결 오류:', error);
              }
            }
          }, 3000);
        } else {
          console.log('나가는 중이거나 컴포넌트가 언마운트되어 재연결하지 않습니다.');
        }
      };
        
      // 연결 시작
      newClient.activate();
      setStompClient(newClient);
    } catch (error) {
      console.error('WebSocket 초기화 오류:', error);
      if (newClient) {
        try {
          newClient.deactivate();
        } catch (deactivateError) {
          console.error('WebSocket 종료 오류:', deactivateError);
        }
      }
    }

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (newClient) {
        try {
          console.log('WebSocket 연결 종료 중...');
          newClient.deactivate();
        } catch (error) {
          console.error('WebSocket 연결 종료 오류:', error);
        }
      }
    };
  }, [roomId, user, isAuthenticated, navigate, isLoading, subscribeToRoom, joinRoom]);

  // 연결 상태 모니터링
  useEffect(() => {
    if (!stompClient || !isConnected || !roomId || isLeaving) return;
    
    console.log('연결 상태 모니터링 시작');
    
    const interval = setInterval(() => {
      // 나가는 중이 아니고 컴포넌트가 마운트된 상태일 때만 모니터링 실행
      if (!isLeaving && componentMountedRef.current) {
        if (stompClient && stompClient.active) {
          console.log('웹소켓 상태:', stompClient.active ? '활성' : '비활성');
          console.log('현재 플레이어 수:', players.length);
          
          // 연결이 활성 상태이지만 플레이어가 없는 경우 재시도
          if (players.length === 0 && user) {
            console.log('연결은 활성 상태지만 플레이어가 없습니다. 재연결 시도...');
            
            // 사용자 정보
            const userInfo = {
              memberId: user.memberId || 0,
              nickname: user.nickname || '게스트',
              characterUrl: user.characterImage || 'default_character'
            };
            
            // 방 참가 요청 재시도
            joinRoom(stompClient, userInfo, roomId);
          }
        }
      } else {
        console.log('나가는 중이거나 컴포넌트가 언마운트되어 모니터링 중지');
        clearInterval(interval);
      }
    }, 10000); // 10초마다 확인
    
    return () => {
      console.log('모니터링 정리');
      clearInterval(interval);
    };
  }, [stompClient, isConnected, roomId, players.length, user, isLeaving, joinRoom]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    // 마운트 시 설정
    componentMountedRef.current = true;
    
    // 언마운트 시 정리
    return () => {
      console.log('컴포넌트 언마운트 - 정리 수행');
      componentMountedRef.current = false;
      setIsLeaving(true);
      
      // 웹소켓 연결 해제 및 정리
      if (stompClient) {
        try {
          // 구독 취소 시도
          try {
            if (roomId) {
              stompClient.unsubscribe(`/topic/room/${roomId}`);
              stompClient.unsubscribe(`/topic/room/${roomId}/chat`);
            }
          } catch (unsubError) {
            console.error('구독 취소 중 오류:', unsubError);
          }
          
          // 연결 해제
          stompClient.deactivate();
        } catch (error) {
          console.error('언마운트 시 연결 해제 오류:', error);
        }
      }
    };
  }, [roomId, stompClient]);

  return {
    stompClient,
    isConnected,
    players,
    currentUser,
    chatMessages,
    subscribeToRoom,
    joinRoom,
    updatePlayersList,
    updatePlayerReadyStatus,
    addChatMessage,
    setPlayers,
    setChatMessages,
    setCurrentUser,
    setIsLeaving,
    isLeaving,
    gameStartInfo,
    setGameStartInfo,
    sessionId,
  };
}

export default useUserWebSocket;