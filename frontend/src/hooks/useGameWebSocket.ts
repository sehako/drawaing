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
  "1": PlayerInfo;
  "2": PlayerInfo;
  "3": PlayerInfo;
  "4": PlayerInfo;
  [key: string]: PlayerInfo;  // 동적 인덱스 접근을 위한 인덱스 시그니처 추가
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
  // 고정된 세션 ID
  const FIXED_ROOM_ID = "67e3b8c70e25f60ac596bd83";
  const FIXED_SESSION_ID = "67e3b8c70e25f60ac596bd84";
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(FIXED_SESSION_ID);
  const [playerConnections, setPlayerConnections] = useState<PlayerConnectionMap>({
    "1": { 
      nickname: "나는 주인", 
      characterUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Mustela_nivalis_-British_Wildlife_Centre-4.jpg", 
      isReady: true, 
      isConnected: false 
    },
    "2": { 
      nickname: "누누", 
      characterUrl: "https://i.namu.wiki/i/-2JTZk-AuNWNev1bdYKRqhZH_ZypgqSrxNMVefQuvGIKYbsRno_Xdj9O_ujouwSvrlI3ky_2wruw05jN2q3zHg.webp", 
      isReady: false, 
      isConnected: false 
    },
    "3": { 
      nickname: "룰룰", 
      characterUrl: "https://mblogthumb-phinf.pstatic.net/MjAyMTA1MjRfMTU2/MDAxNjIxODIzODMwMzg2.LEeKaliV4oWkPeY3F0Y2jX9dkFNH73WyRNeuta77kpMg.o4PEe6AvVkSRrPHIZGQqG9wP3TpseYpN2UKXV624RjcgJPEG.gkfngkfn414/%EC%96%B4%EB%A6%B0%EC%9D%B4%EC%A7%91_%EC%9C%A0%EC%B9%98%EC%9B%90_%EB%B3%91%EC%95%84%EB%A6%AC_%EC%BA%90%EB%A6%AD%ED%84%B0_%EA%B7%B8%EB%A6%AC%EA%B8%B0_(14).jpg?type=w800", 
      isReady: false, 
      isConnected: false 
    },
    "4": { 
      nickname: "문상", 
      characterUrl: "https://images.khan.co.kr/article/2021/12/10/l_2021121002000571800113942.jpg", 
      isReady: false, 
      isConnected: false 
    }
  });
  
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
    if (playerNumber === "1" || playerNumber === "2" || playerNumber === "3" || playerNumber === "4") {
      setPlayerConnections(prev => ({
        ...prev,
        [playerNumber]: {
          ...prev[playerNumber],
          isConnected
        }
      }));
      console.log(`플레이어 ${playerNumber}(${playerConnections[playerNumber].nickname}) 접속 상태: ${isConnected}`);
    }
  };

  const updateRoomPlayers = (roomPlayersData: any) => {
    console.log("방 플레이어 정보 업데이트:", roomPlayersData);
    
    if (!roomPlayersData) return;
    
    // 현재 연결 상태를 복사
    const newConnectionState = { ...playerConnections } as PlayerConnectionMap;
    
    // 모든 플레이어의 접속 상태 초기화
    (["1", "2", "3", "4"] as const).forEach(key => {
      if (newConnectionState[key]) {
        newConnectionState[key] = {
          ...newConnectionState[key],
          isConnected: false
        };
      }
    });
    
    // 서버 데이터에 따라 접속 상태 업데이트
    try {
      // roomPlayersData가 배열인 경우
      if (Array.isArray(roomPlayersData)) {
        roomPlayersData.forEach(player => {
          const playerNumber = player.playerNumber || "";
          if (playerNumber && newConnectionState[playerNumber]) {
            newConnectionState[playerNumber] = {
              ...newConnectionState[playerNumber],
              isConnected: true
            };
          }
        });
      } 
      // roomPlayersData가 객체인 경우
      else if (roomPlayersData && typeof roomPlayersData === 'object') {
        // 접속 상태에 대한 정보가 있는 경우
        if (roomPlayersData.connectedPlayers) {
          Object.entries(roomPlayersData.connectedPlayers).forEach(([playerNumber, isConnected]) => {
            if (newConnectionState[playerNumber]) {
              newConnectionState[playerNumber] = {
                ...newConnectionState[playerNumber],
                isConnected: Boolean(isConnected)
              };
            }
          });
        }
        // 다른 형태의 데이터인 경우 (예: 실제 플레이어 데이터)
        else {
          Object.keys(roomPlayersData).forEach(playerNumber => {
            if (newConnectionState[playerNumber]) {
              newConnectionState[playerNumber] = {
                ...newConnectionState[playerNumber],
                isConnected: true
              };
            }
          });
        }
      }
    } catch (error) {
      console.error("플레이어 정보 업데이트 중 오류:", error);
    }
    
    // 현재 플레이어는 항상 접속 중
    const currentPlayerNumber = localStorage.getItem('playerNumber') || "1";
    if (newConnectionState[currentPlayerNumber]) {
      newConnectionState[currentPlayerNumber] = {
        ...newConnectionState[currentPlayerNumber],
        isConnected: true
      };
    }
    
    console.log("새 접속 상태:", newConnectionState);
    setPlayerConnections(newConnectionState);
  };

  // 웹소켓 연결 설정
  useEffect(() => {
    // 항상 고정된 room ID를 사용
    const effectiveRoomId = FIXED_ROOM_ID;

    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("웹소켓 연결 성공 - URL:", WS_URL);
        console.log("현재 플레이어:", currentPlayer);
        setIsConnected(true);
        
        // 방에 참가 메시지 전송 (고정된 room ID 사용)
        const joinMessage = {
          type: "join_room",
          data: {
            roomId: effectiveRoomId,
            playerName: currentPlayer,
            playerNumber: localStorage.getItem('playerNumber') || "1" 
          }
        };
        
        ws.send(JSON.stringify(joinMessage));
        console.log("방 참가 메시지 전송:", joinMessage);
        
        // 현재 플레이어의 접속 상태 업데이트
        const currentPlayerNumber = localStorage.getItem('playerNumber') || "1";
        if (currentPlayerNumber === "1" || currentPlayerNumber === "2" || 
            currentPlayerNumber === "3" || currentPlayerNumber === "4") {
          handlePlayerConnection(currentPlayerNumber, true);
        }
        
        // 방의 플레이어 정보 요청
        const getRoomPlayersMessage = {
          type: "get_room_players",
          data: { roomId: effectiveRoomId }
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
              if (message.data && message.data.players) {
                console.log("방 플레이어들:", message.data.players);
                updateRoomPlayers(message.data.players);
              }
              break;
            
            case "player_ready":
              if (message.data && message.data.playerNumber) {
                console.log("플레이어 준비 완료:", message.data.playerNumber);
                setPlayerConnections(prev => {
                  if (message.data.playerNumber === "1" || 
                      message.data.playerNumber === "2" || 
                      message.data.playerNumber === "3" || 
                      message.data.playerNumber === "4") {
                    return {
                      ...prev,
                      [message.data.playerNumber]: {
                        ...prev[message.data.playerNumber],
                        isReady: true
                      }
                    };
                  }
                  return prev;
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
        
        // 현재 플레이어의 접속 상태 업데이트
        const currentPlayerNumber = localStorage.getItem('playerNumber') || "1";
        if (currentPlayerNumber === "1" || currentPlayerNumber === "2" || 
            currentPlayerNumber === "3" || currentPlayerNumber === "4") {
          handlePlayerConnection(currentPlayerNumber, false);
        }
        
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
        const leaveMessage = {
          type: "leave_room",
          data: {
            roomId: effectiveRoomId,
            playerName: currentPlayer,
            playerNumber: localStorage.getItem('playerNumber') || "1"
          }
        };
        wsRef.current.send(JSON.stringify(leaveMessage));
        console.log("방 나가기 메시지 전송:", leaveMessage);
        
        wsRef.current.close();
      }
    };
  }, [currentPlayer, FIXED_ROOM_ID, WS_URL]);

  // 하트비트 메시지 전송 (연결 유지)
  useEffect(() => {
    if (!isConnected) return;
    
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const heartbeatMessage = {
          type: "heartbeat",
          data: {
            roomId: FIXED_ROOM_ID,
            sessionId: FIXED_SESSION_ID,
            playerName: currentPlayer,
            playerNumber: localStorage.getItem('playerNumber') || "1"
          }
        };
        wsRef.current.send(JSON.stringify(heartbeatMessage));
        console.log("하트비트 메시지 전송");
      }
    }, 30000); // 30초마다 하트비트 전송

    return () => clearInterval(heartbeatInterval);
  }, [isConnected, currentPlayer, FIXED_ROOM_ID, FIXED_SESSION_ID]);

  return {
    isConnected,
    playerConnections,
    sessionId,
    sendMessage
  };
};

export default useGameWebSocket;