import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import { 
  createStompClient, 
  sendJoinRoomMessage, 
  JoinRoomRequest, 
  Player,
  normalizePlayerData,
  determineHostId
} from '../utils/GameSocketUtils';

interface UseGameWebSocketProps {
  roomId: string;
  user: {
    memberId: number;
    nickname: string;
    characterImage: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseGameWebSocketReturn {
  stompClient: Client | null;
  isConnected: boolean;
  players: Player[];
  currentUser: Player | null;
  chatMessages: string[];
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
}

const useGameWebSocket = ({
  roomId,
  user,
  isAuthenticated,
  isLoading
}: UseGameWebSocketProps): UseGameWebSocketReturn => {
  const navigate = useNavigate();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const componentMountedRef = useRef(true);

  // 웹소켓 데이터 처리 함수들
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
    
    // 객체를 배열로 변환하여 처리
    const updatedPlayers = Object.entries(normalizedData).map(([id, data]: [string, any]) => {
      // 방장 설정: hostId와 일치하는 플레이어를 방장으로
      const isHost = id === hostPlayerId;
      
      return {
        id: id,
        memberId: parseInt(id),
        nickname: data.nickname || '알 수 없음',
        isReady: data.ready || false,  // 서버에서는 ready로 전송됨
        isHost: isHost,
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
      const amIHost = userIdStr === hostPlayerId;
      console.log('내가 방장인가?', amIHost);
      
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
            ? { ...player, isReady: playerData.ready }
            : player
        ));

        // 현재 사용자의 준비 상태 업데이트
        setCurrentUser(prev => 
          prev && prev.id === playerId
            ? { ...prev, isReady: playerData.ready }
            : prev
        );

        // 채팅에 메시지 추가
        const playerName = players.find(p => p.id === playerId)?.nickname || 'Unknown';
        const readyStatus = playerData.ready ? '준비 완료' : '준비 취소';
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

  // 웹소켓 방 구독 함수
  const subscribeToRoom = useCallback((client: Client, roomId: string) => {
    console.log(`방 이벤트 구독 시도: /topic/room/${roomId}`);
    
    // 방 이벤트 구독
    client.subscribe(`/topic/room/${roomId}`, (message) => {
      try {
        console.log('방 이벤트 메시지 수신:', message);
        const data = JSON.parse(message.body);
        console.log('방 이벤트 데이터 수신:', data);
        
        // 타입에 따른 처리
        if (data.type === 'PLAYER_JOIN' || data.type === 'PLAYER_LIST') {
          console.log('플레이어 목록 업데이트 이벤트 감지:', data.type);
          updatePlayersList(data.payload || data);
        } else if (data.type === 'PLAYER_READY') {
          console.log('플레이어 준비 상태 변경 이벤트 감지');
          updatePlayerReadyStatus(data.payload || data);
        } else if (data.type === 'GAME_START') {
          console.log('게임 시작 이벤트 감지');
          navigate('/game');
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
    
    // 채팅 메시지 구독
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
    
    console.log('구독 완료');
  }, [updatePlayersList, updatePlayerReadyStatus, addChatMessage, navigate]);

  // joinRoom 함수 내부를 수정합니다
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
    isLeaving
  };
}

export default useGameWebSocket;