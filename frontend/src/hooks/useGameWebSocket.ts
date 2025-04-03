// hooks/useGameWebSocket.ts
import { useState, useRef, useEffect } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

// 플레이어 정보 인터페이스
interface PlayerInfo {
  nickname: string;
  characterUrl: string;
  isReady: boolean;
  isConnected: boolean;
}

interface PlayerConnectionMap {
  [key: string]: PlayerInfo;  // 동적 인덱스 접근을 위한 인덱스 시그니처
}

interface UseGameWebSocketProps {
  roomId: string | undefined;
  currentPlayer: string;
}

interface UseGameWebSocketReturn {
  isConnected: boolean;
  playerConnections: PlayerConnectionMap;
  sessionId: string | null;
  sendMessage: (messageType: string, messageData: any) => void;
}

const useGameWebSocket = ({ roomId, currentPlayer }: UseGameWebSocketProps): UseGameWebSocketReturn => {
  // 로컬 스토리지에서 roomId와 sessionId 로드
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [playerConnections, setPlayerConnections] = useState<PlayerConnectionMap>({});
  
  const wsRef = useRef<WebSocket | null>(null);
  
  // API URL 설정
  const API_URL = import.meta.env.VITE_API_URL || 'www.drawaing.site';
  const WS_URL = `${API_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/service/game/drawing`;

  // 웹소켓 메시지 전송 함수
  const sendMessage = (messageType: string, messageData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: messageType,
        data: messageData
      };
      wsRef.current.send(JSON.stringify(message));
      console.log("메시지 전송:", message);
    } else {
      console.warn('웹소켓이 연결되어 있지 않습니다.');
    }
  };

  // 특정 플레이어의 접속 상태 업데이트
  const handlePlayerConnection = (playerNumber: string, isConnected: boolean) => {
    setPlayerConnections(prev => {
      if (!prev[playerNumber]) {
        console.warn(`플레이어 ${playerNumber}가 playerConnections에 존재하지 않습니다.`);
        return prev;
      }
      
      const updated = {
        ...prev,
        [playerNumber]: {
          ...prev[playerNumber],
          isConnected
        }
      };
      
      console.log(`플레이어 ${playerNumber}(${prev[playerNumber]?.nickname || '알 수 없음'}) 접속 상태: ${isConnected}`);
      return updated;
    });
  };

  const updateRoomPlayers = (roomPlayersData: any) => {
    console.log("방 플레이어 정보 업데이트:", roomPlayersData);
    
    if (!roomPlayersData) return;
    
    // 서버에서 받은 플레이어 데이터로 새로운 연결 상태 생성
    const newConnectionState: PlayerConnectionMap = {};
    
    try {
      // sessionId가 있으면 저장
      if (roomPlayersData.sessionId) {
        setSessionId(roomPlayersData.sessionId);
        localStorage.setItem('sessionId', roomPlayersData.sessionId);
        console.log("세션 ID 저장:", roomPlayersData.sessionId);
      }
      
      // participants 객체가 있는 경우 처리
      if (roomPlayersData.participants && typeof roomPlayersData.participants === 'object') {
        console.log("participants 객체 발견, 플레이어 정보 추출");
        
        Object.entries(roomPlayersData.participants).forEach(([playerId, playerData]: [string, any]) => {
          newConnectionState[playerId] = {
            nickname: playerData.nickname || '알 수 없음',
            characterUrl: playerData.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown',
            isReady: playerData.ready || false,
            isConnected: true // 서버에서 받은 데이터이므로 연결된 것으로 간주
          };
        });
        
        // 플레이어 목록을 로컬 스토리지에 저장
        try {
          const playersList = Object.entries(newConnectionState).map(([id, data]) => ({
            id,
            memberId: parseInt(id),
            nickname: data.nickname,
            isReady: data.isReady,
            isHost: roomPlayersData.hostId === parseInt(id),
            character: data.characterUrl,
            characterUrl: data.characterUrl
          }));
          
          localStorage.setItem('playersList', JSON.stringify(playersList));
          console.log('플레이어 목록이 로컬스토리지에 저장됨:', playersList);
        } catch (error) {
          console.error('플레이어 목록 저장 중 오류:', error);
        }
      }
      // roomPlayersData가 배열인 경우
      else if (Array.isArray(roomPlayersData)) {
        roomPlayersData.forEach(player => {
          const playerNumber = player.playerNumber || "";
          if (playerNumber) {
            newConnectionState[playerNumber] = {
              nickname: player.nickname || '알 수 없음',
              characterUrl: player.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown',
              isReady: player.isReady || false,
              isConnected: true
            };
          }
        });
      }
      // roomPlayersData가 객체이고 connectedPlayers 속성이 있는 경우
      else if (roomPlayersData && typeof roomPlayersData === 'object') {
        // 접속 상태에 대한 정보가 있는 경우
        if (roomPlayersData.connectedPlayers) {
          Object.entries(roomPlayersData.connectedPlayers).forEach(([playerNumber, isConnected]) => {
            // playerInfo가 없는 경우는 기본값으로 생성
            newConnectionState[playerNumber] = {
              nickname: `플레이어 ${playerNumber}`,
              characterUrl: 'https://placehold.co/400/gray/white?text=Unknown',
              isReady: false,
              isConnected: Boolean(isConnected)
            };
          });
        }
        // 다른 형태의 데이터인 경우 (예: 실제 플레이어 데이터)
        else {
          Object.keys(roomPlayersData).forEach(playerNumber => {
            if (typeof roomPlayersData[playerNumber] === 'object') {
              const playerData = roomPlayersData[playerNumber];
              newConnectionState[playerNumber] = {
                nickname: playerData.nickname || `플레이어 ${playerNumber}`,
                characterUrl: playerData.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown',
                isReady: playerData.ready || playerData.isReady || false,
                isConnected: true
              };
            }
          });
        }
      }
    } catch (error) {
      console.error("플레이어 정보 업데이트 중 오류:", error);
    }
    
    // 현재 플레이어는 항상 접속 중으로 표시
    const currentPlayerNumber = localStorage.getItem('playerNumber');
    if (currentPlayerNumber && newConnectionState[currentPlayerNumber]) {
      newConnectionState[currentPlayerNumber] = {
        ...newConnectionState[currentPlayerNumber],
        isConnected: true
      };
    }
    
    // 빈 객체가 아닌 경우에만 상태 업데이트
    if (Object.keys(newConnectionState).length > 0) {
      console.log("새 플레이어 연결 상태:", newConnectionState);
      setPlayerConnections(newConnectionState);
    } else {
      console.warn("유효한 플레이어 정보가 없습니다.");
    }
  };

  // 웹소켓 연결 설정
  useEffect(() => {
    // 로컬 스토리지에서 roomId 가져오기
    const storedRoomId = localStorage.getItem('roomId');
    // 실제 사용할 roomId 결정
    const effectiveRoomId = roomId || storedRoomId;
    
    if (!effectiveRoomId) {
      console.error('유효한 roomId가 없습니다.');
      return;
    }
    
    console.log('웹소켓 연결 시도 - roomId:', effectiveRoomId);

    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("웹소켓 연결 성공 - URL:", WS_URL);
        console.log("현재 플레이어:", currentPlayer);
        setIsConnected(true);
        
        const storedSessionId = localStorage.getItem('sessionId');
        const currentPlayerNumber = localStorage.getItem('playerNumber') || "1";
        
        // 방에 참가 메시지 전송
        const joinMessage = {
          type: "join_room",
          data: {
            roomId: effectiveRoomId,
            sessionId: storedSessionId, // 세션 ID가 있으면 포함
            playerName: currentPlayer,
            playerNumber: currentPlayerNumber
          }
        };
        
        ws.send(JSON.stringify(joinMessage));
        console.log("방 참가 메시지 전송:", joinMessage);
        
        // 방의 플레이어 정보 요청
        const getRoomPlayersMessage = {
          type: "get_room_players",
          data: { 
            roomId: effectiveRoomId,
            sessionId: storedSessionId
          }
        };
        ws.send(JSON.stringify(getRoomPlayersMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          console.log("받은 웹소켓 메시지:", message);
          
          switch (message.type) {
            case "session_created":
              if (message.data && message.data.sessionId) {
                setSessionId(message.data.sessionId);
                localStorage.setItem('sessionId', message.data.sessionId);
                console.log("세션 ID 설정:", message.data.sessionId);
              }
              break;
              
            case "player_connected":
              if (message.data && message.data.playerNumber) {
                console.log("플레이어 연결:", message.data.playerNumber);
                handlePlayerConnection(message.data.playerNumber, true);
              }
              break;
            
            case "player_disconnected":
              if (message.data && message.data.playerNumber) {
                console.log("플레이어 연결 해제:", message.data.playerNumber);
                handlePlayerConnection(message.data.playerNumber, false);
              }
              break;
            
            case "room_players":
              if (message.data) {
                console.log("방 플레이어들:", message.data);
                updateRoomPlayers(message.data);
              }
              break;
            
            case "player_ready":
              if (message.data && message.data.playerNumber) {
                console.log("플레이어 준비 완료:", message.data.playerNumber);
                setPlayerConnections(prev => {
                  if (!prev[message.data.playerNumber]) {
                    return prev;
                  }
                  return {
                    ...prev,
                    [message.data.playerNumber]: {
                      ...prev[message.data.playerNumber],
                      isReady: true
                    }
                  };
                });
              }
              break;
              
            default:
              console.log("알 수 없는 메시지 타입:", message.type);
          }
        } catch (error) {
          console.error("메시지 처리 중 오류 발생:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("웹소켓 연결 종료 상세 정보:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        setIsConnected(false);
        
        // 연결이 종료되면 5초 후 재연결 시도
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error("웹소켓 오류:", error);
      };
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // 방에서 나가는 메시지 전송
        const storedSessionId = localStorage.getItem('sessionId');
        const currentPlayerNumber = localStorage.getItem('playerNumber') || "1";
        
        const leaveMessage = {
          type: "leave_room",
          data: {
            roomId: effectiveRoomId,
            sessionId: storedSessionId,
            playerName: currentPlayer,
            playerNumber: currentPlayerNumber
          }
        };
        wsRef.current.send(JSON.stringify(leaveMessage));
        console.log("방 나가기 메시지 전송:", leaveMessage);
        
        wsRef.current.close();
      }
    };
  }, [currentPlayer, roomId, WS_URL]);

  // 하트비트 메시지 전송 (연결 유지)
  useEffect(() => {
    if (!isConnected) return;
    
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const storedRoomId = localStorage.getItem('roomId');
        const storedSessionId = localStorage.getItem('sessionId');
        const currentPlayerNumber = localStorage.getItem('playerNumber') || "1";
        
        // 실제 사용할 roomId 결정
        const effectiveRoomId = roomId || storedRoomId;
        
        if (!effectiveRoomId) {
          console.warn('하트비트 전송 실패: 유효한 roomId가 없습니다.');
          return;
        }
        
        const heartbeatMessage = {
          type: "heartbeat",
          data: {
            roomId: effectiveRoomId,
            sessionId: storedSessionId,
            playerName: currentPlayer,
            playerNumber: currentPlayerNumber
          }
        };
        wsRef.current.send(JSON.stringify(heartbeatMessage));
        console.log("하트비트 메시지 전송");
      }
    }, 30000); // 30초마다 하트비트 전송

    return () => clearInterval(heartbeatInterval);
  }, [isConnected, currentPlayer, roomId]);

  // 컴포넌트 마운트 시 로컬 스토리지에서 플레이어 목록 로드
  useEffect(() => {
    try {
      const storedPlayersList = localStorage.getItem('playersList');
      if (storedPlayersList) {
        const playersList = JSON.parse(storedPlayersList);
        console.log('로컬 스토리지에서 플레이어 목록 로드:', playersList);
        
        // 초기 playerConnections 설정
        const initialConnections: PlayerConnectionMap = {};
        
        playersList.forEach((player: any) => {
          if (player.id) {
            initialConnections[player.id] = {
              nickname: player.nickname || '알 수 없음',
              characterUrl: player.characterUrl || player.character || 'https://placehold.co/400/gray/white?text=Unknown',
              isReady: player.isReady || false,
              isConnected: false // 초기에는 모두 연결 안 된 상태로 설정
            };
          }
        });
        
        // 빈 객체가 아닌 경우에만 상태 업데이트
        if (Object.keys(initialConnections).length > 0) {
          setPlayerConnections(initialConnections);
        }
      }
    } catch (error) {
      console.error('저장된 플레이어 목록 로드 중 오류:', error);
    }
  }, []);

  return {
    isConnected,
    playerConnections,
    sessionId,
    sendMessage
  };
};

export default useGameWebSocket;