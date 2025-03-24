import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerSection from '../components/Game/PlayerSection';
import CanvasSection from '../components/Game/CanvasSection';
import AISection from '../components/Game/AIsection';
import word from '../assets/Game/word.png';
import axios from 'axios';

interface Player {
  id: number;
  name: string;
  level: number;
  avatar: string;
}

// 플레이어 접속 상태를 추적하기 위한 맵 인터페이스 - 인덱스 시그니처 추가
interface PlayerConnectionMap {
  [name: string]: boolean;
}

// 웹소켓 메시지 인터페이스
interface WebSocketMessage {
  type: string;
  data: any;
}

// URL 파라미터 타입 정의 수정
interface GameParams {
  roomId?: string;
}

const Game: React.FC = () => {
  // URL에서 roomId 파라미터 가져오기 - 타입 수정
  const params = useParams<{ roomId?: string }>();
  const roomId = params.roomId;
  const navigate = useNavigate();
  
  // roomId가 없으면 기본 방으로 리다이렉트
  useEffect(() => {
    if (!roomId) {
      navigate('/game/1');
    }
  }, [roomId, navigate]);

  // 환경 변수에서 API URL을 가져옴
  const API_URL = import.meta.env.VITE_API_URL || 'https://www.drawaing.site';
  const WS_URL = `${API_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/service/game/drawing`;
  
  // 웹소켓 연결 참조
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // 현재 플레이어 이름 (로컬 스토리지에서 가져오거나 랜덤 생성)
  const [currentPlayer, setCurrentPlayer] = useState<string>(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName && storedName.startsWith('플레이어')) {
      return storedName;
    } else {
      // 랜덤으로 플레이어 이름 생성
      const randomPlayer = '플레이어' + Math.floor(Math.random() * 4 + 1);
      localStorage.setItem('playerName', randomPlayer);
      return randomPlayer;
    }
  });
  
  // 플레이어 접속 상태 맵 - 인터페이스 적용
  const [playerConnections, setPlayerConnections] = useState<PlayerConnectionMap>({
    "플레이어1": false,
    "플레이어2": false,
    "플레이어3": false,
    "플레이어4": false
  });

  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: 'Player 1', level: 1, avatar: '/avatars/chick.png' },
    { id: 1, name: 'Player 2', level: 50, avatar: '/avatars/muscular.png' },
    { id: 2, name: 'Player 3', level: 25, avatar: '/avatars/angry-bird.png' },
    { id: 3, name: 'Player 4', level: 16, avatar: '/avatars/yellow-bird.png' },
  ]);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [quizWord, setQuizWord] = useState<string>('바나나');
  const [timeLeft, setTimeLeft] = useState<number>(20); 
  const [activeDrawerIndex, setActiveDrawerIndex] = useState<number>(0);
  const [guesserIndex, setGuesserIndex] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>('');
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false);
  const [correctAnimation, setCorrectAnimation] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('red');
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const [eggCount, setEggCount] = useState(10);
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [aiImages] = useState<string[]>([
    '/ai/fox.png',
    '/ai/eggs.png'
  ]);

  const [predictions, setPredictions] = useState<{ class: string; probability: number }[]>([]);

  // 웹소켓 연결 설정
  useEffect(() => {
    if (!roomId) return; // roomId가 없으면 연결하지 않음
    
    // 웹소켓 연결 생성
    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("웹소켓 연결 성공");
        setIsConnected(true);
        
        // 방에 참가 메시지 전송
        const joinMessage = {
          type: "join_room",
          data: {
            roomId: roomId,
            playerName: currentPlayer // 현재 플레이어 이름 사용
          }
        };
        ws.send(JSON.stringify(joinMessage));
        
        // 자신의 접속 상태 업데이트
        handlePlayerConnection(currentPlayer, true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // 메시지 타입에 따라 처리
          switch (message.type) {
            case "player_connected":
              // 플레이어 접속 정보 업데이트
              handlePlayerConnection(message.data.playerName, true);
              break;
            
            case "player_disconnected":
              // 플레이어 접속 종료 정보 업데이트
              handlePlayerConnection(message.data.playerName, false);
              break;
            
            case "room_players":
              // 방의 모든 플레이어 정보 업데이트
              updateRoomPlayers(message.data.players);
              break;
            
            default:
              console.log("알 수 없는 메시지 타입:", message.type);
          }
        } catch (error) {
          console.error("메시지 처리 중 오류 발생:", error);
        }
      };

      ws.onclose = () => {
        console.log("웹소켓 연결 종료");
        setIsConnected(false);
        
        // 자신의 접속 상태 업데이트
        handlePlayerConnection(currentPlayer, false);
        
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
            roomId: roomId,
            playerName: currentPlayer
          }
        };
        wsRef.current.send(JSON.stringify(leaveMessage));
        
        wsRef.current.close();
      }
    };
  }, [roomId, currentPlayer]);

  // 특정 플레이어의 접속 상태 업데이트
  const handlePlayerConnection = (playerName: string, isConnected: boolean) => {
    if (playerName.startsWith('플레이어')) {
      setPlayerConnections(prev => ({
        ...prev,
        [playerName]: isConnected
      }));
    }
  };

  // 방의 모든 플레이어 정보 업데이트
  const updateRoomPlayers = (roomPlayers: {playerName: string}[]) => {
    // 인덱스 시그니처를 사용하여 타입 안전하게 선언
    const newConnectionState: PlayerConnectionMap = {
      "플레이어1": false,
      "플레이어2": false,
      "플레이어3": false,
      "플레이어4": false
    };
    
    // 접속 중인 플레이어 표시
    roomPlayers.forEach(player => {
      if (player.playerName.startsWith('플레이어')) {
        newConnectionState[player.playerName] = true;
      }
    });
    
    // 자신은 항상 접속 중으로 표시
    newConnectionState[currentPlayer] = true;
    
    setPlayerConnections(newConnectionState);
  };

  // 하트비트 메시지 전송 (연결 유지)
  useEffect(() => {
    if (!roomId) return; // roomId가 없으면 실행하지 않음
    
    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const heartbeatMessage = {
          type: "heartbeat",
          data: {
            roomId: roomId,
            playerName: currentPlayer
          }
        };
        wsRef.current.send(JSON.stringify(heartbeatMessage));
      }
    }, 30000); // 30초마다 하트비트 전송

    return () => clearInterval(heartbeatInterval);
  }, [roomId, currentPlayer]);

  const handlePlayerCorrectAnswer = () => {
    setEggCount(prev => prev + 1);
  };
  
  const handleAICorrectAnswer = () => {
    setEggCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContext(ctx);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeout(() => {
        const nextDrawerIndex = (activeDrawerIndex + 1) % 3;
        setActiveDrawerIndex(nextDrawerIndex);
        
        if (nextDrawerIndex === 0) {
          setCurrentRound(prev => prev + 1);
          setGuesserIndex((guesserIndex + 1) % 4);
          
          if (context && canvasRef.current) {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
  
          const newWords = ['사과', '자동차', '컴퓨터', '강아지'];
          setQuizWord(newWords[Math.floor(Math.random() * newWords.length)]);
        }
        
        setTimeLeft(20);
        setHasCompleted(false);
      }, 3000);
      return;
    }
  
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
  
    return () => clearInterval(timer);
  }, [timeLeft, context, guesserIndex, activeDrawerIndex]);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setIsEraser(false);
  };

  const handleEraserToggle = () => {
    setIsEraser(true);
  };

  const handleNextPlayer = () => {
    setIsDrawing(false);
    setHasCompleted(false);

    const nextDrawerIndex = (activeDrawerIndex + 1) % 3;
    setActiveDrawerIndex(nextDrawerIndex);
    
    setTimeLeft(20);

    if (nextDrawerIndex === 0) {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setGuesserIndex((guesserIndex + 1) % 4);
        
        if (context && canvasRef.current) {
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        const newWords = ['사과', '자동차', '컴퓨터', '강아지'];
        setQuizWord(newWords[Math.floor(Math.random() * newWords.length)]);
      }, 3000);
    }
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guess.trim()) return;
    
    if (guess.trim().toLowerCase() === quizWord.toLowerCase()) {
      setCorrectAnimation(true);
      setShowCorrectAnswer(true);
      handlePlayerCorrectAnswer();

      setTimeout(() => {
        setCorrectAnimation(false);
        setShowCorrectAnswer(false);
        
        setCurrentRound(prev => prev + 1);
        setGuesserIndex((guesserIndex + 1) % 4);
        setActiveDrawerIndex(0);
        
        setTimeLeft(20);
        
        setHasCompleted(false);
        
        if (context && canvasRef.current) {
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        
        const newWords = ['사과', '자동차', '컴퓨터', '강아지', '고양이', '비행기', '꽃', '커피'];
        setQuizWord(newWords[Math.floor(Math.random() * newWords.length)]);
      }, 2000);
    } else {
      setAiAnswer('틀렸습니다! 다시 시도해보세요.');
    }
    
    setGuess('');
  };

  const handlePass = () => {
    setCurrentRound(prev => prev + 1);
    setGuesserIndex((guesserIndex + 1) % 4);
    setActiveDrawerIndex(0);
    
    setTimeLeft(20);
    
    setHasCompleted(false);
    setShowCorrectAnswer(false);
    
    if (context && canvasRef.current) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    const newWords = ['사과', '자동차', '컴퓨터', '강아지'];
    setQuizWord(newWords[Math.floor(Math.random() * newWords.length)]);
  };

  const calculateCurrentDrawerPlayerIndex = () => {
    let tempIndex = 0;
    let realIndex = 0;
    
    for (let i = 0; i < 4; i++) {
      if (i !== guesserIndex) {
        if (tempIndex === activeDrawerIndex) {
          realIndex = i;
          break;
        }
        tempIndex++;
      }
    }
    
    return realIndex;
  };

  const handleCanvasSubmit = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "drawing.png");
  
    try {
      const response = await axios.post("http://localhost:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setPredictions(response.data.predictions);
      return response.data.predictions;
    } catch (error) {
      console.error("예측 요청 실패:", error);
      throw error;
    }
  };

  const currentDrawerIndex = calculateCurrentDrawerPlayerIndex();
  const currentDrawer = players[currentDrawerIndex];

  if (!roomId) {
    return <div>방 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-cover bg-[url('/backgrounds/wooden-bg.jpg')] px-[150px] py-4 box-border flex-col">
      {/* 게임 정보 헤더 */}
      <div className="w-full max-w-7xl h-[100px] mb-4">
        <div className="flex justify-center items-center p-2.5 rounded-t-lg h-full">
          <div className="flex items-center w-full">
            <div className="flex-1 text-left pl-10">
              <div className="text-6xl font-bold text-gray-800 whitespace-nowrap">ROUND {currentRound}</div>
            </div>
            
            <div className="flex-1 flex justify-center items-center">
              <div className="relative flex items-center justify-center w-[200px] h-full">
                <img 
                  src={word} 
                  alt="Word background" 
                  className="absolute w-full h-auto object-cover mb-5"
                />
                <div className="relative z-10 text-white text-3xl font-bold text-center mt-6">
                  {quizWord}
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-right pr-10">
              <div className="text-lg text-gray-700 text-5xl">남은시간: {timeLeft}초</div>
            </div>
          </div>
        </div>
      </div>

      {/* 방 정보 및 웹소켓 연결 상태 표시 */}
      <div className="w-full max-w-7xl mb-4 p-2 rounded text-center bg-yellow-50 text-amber-800 border border-amber-200">
        <div className="font-bold">게임방 #{roomId}</div>
        <div className={`mt-1 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? `실시간 연결 활성화: 당신은 ${currentPlayer}입니다` : '연결 끊김: 재연결 중...'}
        </div>
      </div>

      <div className="flex w-full max-w-7xl">
        {/* 플레이어 컴포넌트 - 좌측 */}
        <div className="w-1/5 mr-8">
          <PlayerSection 
            currentRound={currentRound}
            activeDrawerIndex={activeDrawerIndex}
            guesserIndex={guesserIndex}
            roomId={roomId}
            playerConnections={playerConnections} // 플레이어 접속 상태 전달
            isConnected={isConnected} // 웹소켓 연결 상태 전달
          />
        </div>

        {/* 캔버스 컴포넌트 - 중앙 */}
        <div className="w-3/5 mr-4">
          <CanvasSection 
            canvasRef={canvasRef}
            context={context}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            lastPoint={lastPoint}
            setLastPoint={setLastPoint}
            currentColor={currentColor}
            isEraser={isEraser}
            showCorrectAnswer={showCorrectAnswer}
            quizWord={quizWord}
            currentRound={currentRound}
            timeLeft={timeLeft}
            hasCompleted={hasCompleted}
            setHasCompleted={setHasCompleted}
            handleColorChange={handleColorChange}
            handleEraserToggle={handleEraserToggle}
            handleNextPlayer={handleNextPlayer}
            currentDrawer={currentDrawer}
            calculateCurrentDrawerPlayerIndex={calculateCurrentDrawerPlayerIndex}
            guess={guess}
            setGuess={setGuess}
            handleGuessSubmit={handleGuessSubmit}
            handlePass={handlePass}
            activeDrawerIndex={activeDrawerIndex}
            handleCanvasSubmit={handleCanvasSubmit}
            setPredictions={setPredictions}
          />
        </div>

        {/* AI 컴포넌트 - 우측 */}
        <div className="w-1/5">
          <AISection 
            aiImages={aiImages}
            aiAnswer={aiAnswer}
            guess={guess}
            setGuess={setGuess}
            handleGuessSubmit={handleGuessSubmit}
            handlePass={handlePass}
            eggCount={eggCount}
            onAICorrectAnswer={handleAICorrectAnswer}
            quizWord={quizWord}
            predictions={predictions}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;