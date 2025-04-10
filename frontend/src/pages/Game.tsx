import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerSection from '../components/Game/PlayerSection';
import CanvasSection from '../components/Game/CanvasSection';
import AISection from '../components/Game/AIsection';
import word from '../assets/Game/word.png';
import axios from 'axios';
import pen_sound from '../assets/Sound/drawing_sound.mp3';
import RoundTransition from '../components/Game/RoundTransition';
import useGameWebSocket from '../hooks/useGameWebSocket';
import useGameTimer from '../hooks/useGameTimer'; // 타이머 훅 추가
import gameTimerService from '../api/gameTimerService';
import chatService from '../api/chatservice';
import correctAnswerService from '../api/correctAnswerService';
import background from '../assets/Game/background.jpg'
import { DrawPoint } from '../api/drawingService';
import { PlayerPermissions, PlayerRole, PositionMap } from '../components/Game/PlayerSection'; // 경로는 실제 PlayerSection 컴포넌트 위치에 맞게 조정
import sessionInfoService from '../api/sessionInfoService';
import turnService from '../api/turnService'; // 서비스 import 추가
import sessionResultService, { SessionResultData } from '../api/sessionResultService'; // SessionResultData 타입도 함께 import

interface Player {
  id: number;
  name: string;
  level: number;
  avatar: string;
}
const getPlayerIdByNumber = (playerNumber: string): number => {
  switch (playerNumber) {
    case "1": return 1;
    case "2": return 2;
    case "3": return 3;
    case "4": return 4;
    default: return 1;
  }
};

const Game: React.FC = () => {
  // URL에서 roomId 파라미터 가져오기
  const { roomId: storedRoomId } = useParams<{ roomId?: string }>();
  
  // ReadyButton과 동일한 방식으로 선언 - 초기값 null로 설정
  const [roomId, setRoomId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [storedPlayersList, setStoredPlayersList] = useState<Array<{ id: number; name: string; level: number; avatar: string }>>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passCount, setPassCount] = useState<number>(0);
  const MAX_PASS_COUNT = 3;
  const [paredUser, setParedUser] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [sessionResultData, setSessionResultData] = useState<SessionResultData | null>(null);
  const [isResultDataReady, setIsResultDataReady] = useState<boolean>(false);

  
  
  // ReadyButton과 일관된 방식으로 roomId 초기화 및 업데이트
  useEffect(() => {
    const storedRoomId = localStorage.getItem('roomId');    
    const roomIdToUse = storedRoomId;

    
    console.log('Game.tsx - roomId 설정 과정:');
    console.log('- URL 파라미터 roomId:', storedRoomId);
    console.log('- localStorage roomId:', storedRoomId);
    console.log('- 최종 선택된 roomId:', roomIdToUse);
    
    // 결정된 roomId 설정 (null일 경우를 대비해 빈 문자열로 변환)
    setRoomId(storedRoomId || '');

    
    // 결정된 roomId를 localStorage에 저장 (다른 컴포넌트와 공유)
    if (storedRoomId) {
      localStorage.setItem('roomId', storedRoomId);
    }
  }, [storedRoomId]);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  // roomId가 없으면 기본 방으로 리다이렉트
  useEffect(() => {
    if (!storedRoomId) {
      navigate('/game/1');
    }
  }, [roomId, navigate]);

  useEffect(() => {
    // 오디오 요소 생성
    const audio = new Audio(pen_sound);
    audio.volume = 0.3;
    audio.preload = 'auto';
    
    // 오디오 로드 확인
    audio.addEventListener('canplaythrough', () => {
      console.log('오디오 로드 완료!');
    });
    
    audio.addEventListener('error', (e) => {
      console.error('오디오 로드 오류:', e);
      console.log('시도한 소스 경로:', pen_sound);
    });
    
    // REF에 오디오 요소 저장
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  useEffect(() => {
    try {
      const storedPlayersListStr = localStorage.getItem('playersList');
      if (storedPlayersListStr) {
        const parsedPlayersList = JSON.parse(storedPlayersListStr);
        
        // PlayerSection에서 필요한 형태로 데이터 변환
        const formattedPlayersList = parsedPlayersList.map((player: any) => ({
          id: parseInt(player.id), 
          name: player.nickname,
          level: 1, // 기본 레벨 설정
          avatar: player.characterUrl || 'default_character'
        }));
        
        console.log('변환된 플레이어 목록:', formattedPlayersList);
        setStoredPlayersList(formattedPlayersList);
        
        // 현재 사용자 찾기
        const currentPlayerId = localStorage.getItem('playerNumber');
        if (currentPlayerId) {
          const user = formattedPlayersList.find((p: any) => p.id.toString() === currentPlayerId);
          if (user) {
            setCurrentUser(user);
          }
        }
      }
    } catch (error) {
      console.error('플레이어 목록 로드 중 오류:', error);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('playerNumber')) {
      localStorage.setItem('playerNumber', '1'); // 초기값으로 1 설정
    }
  }, []);
  
  // 현재 플레이어 닉네임 설정
  const [currentPlayer, setCurrentPlayer] = useState<string>(() => {
    const playerNumber = localStorage.getItem('playerNumber') || "1";
    return getPlayerNickname(playerNumber);
  });
  
  // 플레이어 번호에 따른 닉네임 반환 함수
  function getPlayerNickname(playerNumber: string): string {
    switch (playerNumber) {
      case "1": return "나는 주인";
      case "2": return "누누";
      case "3": return "룰루";
      case "4": return "문상";
      default: return "플레이어";
    }
  }
  
  
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [quizWord, setQuizWord] = useState<string>('');
  const [activeDrawerIndex, setActiveDrawerIndex] = useState<number>(0);
  const [guesserIndex, setGuesserIndex] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>('');
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false);
  const [correctAnimation, setCorrectAnimation] = useState<boolean>(false);
  const [humanRoundWinCount, setHumanRoundWinCount] = useState<number>(0);
  const [aiRoundWinCount, setAIRoundWinCount] = useState<number>(0);
  const [isHumanCorrect, setIsHumanCorrect] = useState<boolean>(false);
  const [isEmptyGuess, setIsEmptyGuess] = useState<boolean>(false);
  const [isWrongGuess, setIsWrongGuess] = useState<boolean>(false);
  const [isRoundTransitioning, setIsRoundTransitioning] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  // 정답 제출 횟수 제한 추가
  const [guessSubmitCount, setGuessSubmitCount] = useState<number>(0);
  const MAX_GUESS_SUBMIT_COUNT = 3;
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('red');
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<DrawPoint | null>(null);

  // 이렇게 변경
const [playerMessages, setPlayerMessages] = useState<Record<string | number, string>>({});


  const [currentPlayerRole, setCurrentPlayerRole] = useState<PlayerRole | null>(null);
  const [wordList, setWordList] = useState<string[]>([]);
  const [drawOrder, setDrawOrder] = useState<number[]>([]);
  const [sessionInfoData, setSessionInfoData] = useState<any>(null); // 전체 세션 데이터를 저장할 변수
  // const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const wordListIndexRef = useRef(0);

  const [storedSessionId, setStoredSessionId] = useState<string | null>(null);
  const [playerPermissions, setPlayerPermissions] = useState<PlayerPermissions>({
    canDraw: false,
    canGuess: false,
    canSeeWord: false,
    canAnswer: false
  });
  const [roundResult, setRoundResult] = useState<{ 
    isWin: boolean, 
    round: number 
  } | null>(null);

  const [aiCorrectDetected, setAiCorrectDetected] = useState<boolean>(false);

  const [eggCount, setEggCount] = useState(10);
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [aiImages] = useState<string[]>([
    '/ai/fox.png',
    '/ai/eggs.png'
  ]);
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: 'Player 1', level: 1, avatar: '/avatars/chick.png' },
    { id: 1, name: 'Player 2', level: 50, avatar: '/avatars/muscular.png' },
    { id: 2, name: 'Player 3', level: 25, avatar: '/avatars/angry-bird.png' },
    { id: 3, name: 'Player 4', level: 16, avatar: '/avatars/yellow-bird.png' },
  ]);

  const [activePlayerId, setActivePlayerId] = useState<number>(1); // 초기값 1로 설정

  const mapUserIdToPlayerId = (userId: number): number => {
    switch(userId) {
      case 1: return 0; // userId 1은 첫 번째 플레이어 (플레이어1)
      case 2: return 1; // userId 2는 두 번째 플레이어 (플레이어2)
      case 3: return 2; // userId 3은 세 번째 플레이어 (플레이어3)
      case 4: return 3; // userId 4는 네 번째 플레이어 (플레이어4)
      default: return 0;
    }
  };

  const handleActivePlayerChange = (playerId: number) => {
    console.log(`Game.tsx - 활성 플레이어 ID 업데이트: ${playerId}`);
    setActivePlayerId(playerId);
  };

  const handlePlayerRoleChange = (roleInfo: {
    role: PlayerRole | null;
    isCurrentPlayer: boolean;
    currentPositions: PositionMap;
    playerPermissions: PlayerPermissions;
  }) => {
    setCurrentPlayerRole(roleInfo.role);
    setPlayerPermissions(roleInfo.playerPermissions);
    
    // 현재 그림을 그리는 플레이어 ID 추적
    if (roleInfo.playerPermissions.canDraw) {
      // 그림을 그릴 수 있는 권한이 있는 플레이어의 ID 찾기
      const drawerIndex = calculateCurrentDrawerPlayerIndex();
      const drawerPlayer = players[drawerIndex];
      if (drawerPlayer) {
        setActivePlayerId(drawerPlayer.id);
        console.log("활성 플레이어 ID 업데이트:", drawerPlayer.id);
      }
    }
  };

  const [predictions, setPredictions] = useState<{ result: string; correct: boolean }>({
    result: "", 
    correct: false, 
  });
  
  // 웹소켓 훅 사용 - roomId가 null일 때도 빈 문자열로 처리하도록 수정
  const { isConnected, playerConnections, sessionId, sendMessage } = useGameWebSocket({
    roomId: roomId ?? "", // null이면 빈 문자열로 변환
    currentPlayer
  });

  const handleStartDrawing = () => {
    if (playerPermissions.canDraw) {
      setIsDrawing(true);
    } else {
      // 그림 그리기 권한 없음 알림
      alert('현재 그림을 그릴 수 없습니다.');
    }
  };

  const renderQuizWord = () => {
    if (playerPermissions.canSeeWord) {
      return <div>{quizWord}</div>;
    } else {
      return <div>???</div>; // 제시어 숨기기
    }
  };



  useEffect(() => {
    if (!roomId || !sessionId || !isConnected) return;
    
    const setupResultSubscription = async () => {
      // STOMP 클라이언트 초기화 및 구독 설정
      await sessionResultService.initializeClient(roomId, sessionId);
      const unsubscribe = sessionResultService.subscribeToSessionResult(
        roomId, sessionId, 
        (resultData) => {
          setSessionResultData(resultData);
          localStorage.setItem('sessionResultData', JSON.stringify(resultData));
          setIsResultDataReady(true);
        }
      );
      return () => unsubscribe();
    };
    
    setupResultSubscription();
  }, [roomId, sessionId, isConnected]);
  
  const handleGameOver = useCallback(() => {
    console.log('게임 타이머 종료, 게임 종료 처리');
    setIsGameOver(true);
    
    // 게임 종료 시 필요한 추가 상태 리셋 로직이 있다면 여기에 추가
    setIsDrawing(false);
    setHasCompleted(true);
  }, []);

  useEffect(() => {
    // AI가 정답을 맞췄을 경우
    if (predictions.correct) {
      // AI 정답 감지 상태 설정
      setAiCorrectDetected(true);
    }
  }, [predictions])

  useEffect(() => {
    // AI 정답이 감지되고, roomId와 sessionId가 있을 때
    if (aiCorrectDetected && roomId && sessionId) {
      try {
        // 현재 활성화된 플레이어의 ID 사용
        const drawingMemberId = activePlayerId;
        
        // AI의 고정된 멤버 ID (예: -1 또는 특정 값)
        const aiMemberId = -1;
        
        // 현재 그림 그리는 순서
        const drawingOrder = activeDrawerIndex + 1;
        
        // 정답 정보 전송
        correctAnswerService.sendCorrectAnswer(
          roomId,
          sessionId,
          drawingMemberId,
          aiMemberId,
          drawingOrder,
          (roundResult) => {
            console.log('AI 정답 전송 후 라운드 결과:', roundResult);
          }
        );
        
        // 상태 초기화
        setAiCorrectDetected(false);
      } catch (error) {
        console.error('AI 정답 전송 중 오류:', error);
        setAiCorrectDetected(false);
      }
    }
  }, [aiCorrectDetected, roomId, sessionId, activePlayerId, activeDrawerIndex]);

  useEffect(() => {
    // AI 정답이 감지되고, roomId와 sessionId가 있을 때
    if (aiCorrectDetected && roomId && sessionId) {
      try {
        // 현재 활성화된 플레이어의 ID 사용
        const drawingMemberId = activePlayerId;
        
        // AI의 고정된 멤버 ID (예: -1 또는 특정 값)
        const aiMemberId = -1;
        
        // 현재 그림 그리는 순서
        const drawingOrder = activeDrawerIndex + 1;
        
        // 정답 정보 전송
        correctAnswerService.sendCorrectAnswer(
          roomId,
          sessionId,
          drawingMemberId,
          aiMemberId,
          drawingOrder,
          (roundResult) => {
            console.log('AI 정답 전송 후 라운드 결과:', roundResult);
          }
        );
    
        // AI 승리 신호 전송 (라운드 전환을 위한 신호)
        correctAnswerService.sendAIWinSignal(roomId, sessionId);
        
        // 상태 초기화
        setAiCorrectDetected(false);
      } catch (error) {
        console.error('AI 정답 전송 중 오류:', error);
        setAiCorrectDetected(false);
      }
    }
  }, [aiCorrectDetected, roomId, sessionId, activePlayerId, activeDrawerIndex]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('로컬 스토리지에서 가져온 currentUser:', parsedUser);
      setParedUser(parsedUser); // 상태에 저장
    } else {
      console.log('로컬 스토리지에 currentUser가 없습니다.');
    }
  }, []);
  
  // playerConnections 객체로부터 플레이어 정보를 동적으로 업데이트하는 useEffect 추가
  useEffect(() => {
    // 로컬 스토리지에서 ID 정보 가져오기
    const storedUserId = localStorage.getItem('userId');
    
    // GameWaitingRoom에서 설정된 ID를 확인
    if (storedUserId) {
      console.log('로컬 스토리지에서 사용자 ID 불러옴:', storedUserId);
      setCurrentUserId(storedUserId);
    } else {
      // 웹소켓 커넥션에서 ID 정보 확인
      if (playerConnections && Object.keys(playerConnections).length > 0) {
        const playerIds = Object.keys(playerConnections);
        console.log('사용 가능한 플레이어 ID 목록:', playerIds);
        
        // 첫 번째 ID를 기본값으로 설정
        const newUserId = playerIds[0];
        localStorage.setItem('userId', newUserId);
        setCurrentUserId(newUserId);
        console.log('새 사용자 ID 설정:', newUserId);
      }
    }
  }, [playerConnections]);
  useEffect(() => {
    // 웹소켓 연결이 없거나 playerConnections가 비어있으면 처리하지 않음
    if (!isConnected || Object.keys(playerConnections).length === 0) return;
    
    console.log('방 접속 정보로부터 플레이어 정보 업데이트:', playerConnections);
    
    // 업데이트할 플레이어 배열 초기화
    const updatedPlayers: Player[] = [];
    
    // playerConnections 객체를 순회하며 플레이어 정보 추출
    Object.entries(playerConnections).forEach(([playerNumber, info]: [string, any]) => {
      if (info && typeof info === 'object') {
        const playerIndex = parseInt(playerNumber) - 1;
        const isConnected = info.isConnected || false;
        
        // 연결된 플레이어만 추가
        if (isConnected) {
          updatedPlayers.push({
              id: playerIndex,
              name: info.nickname || `플레이어${playerNumber}`,
              level: playerIndex + 1, // 간단한 레벨 설정
              avatar: info.characterUrl || `https://placehold.co/400/gray/white?text=Player${playerNumber}`
            });
          }
        }
      });
      
      // 플레이어 수가 4명 미만인 경우, 남은 슬롯을 대기 중 상태로 채움
      while (updatedPlayers.length < 4) {
        const nextIndex = updatedPlayers.length;
        updatedPlayers.push({
          id: nextIndex,
          name: `대기 중...`,
          level: 0,
          avatar: `https://placehold.co/400/gray/white?text=Waiting`
        });
      }
      
      console.log('업데이트된 플레이어 정보:', updatedPlayers);
      
      // players 상태 업데이트 (Game.tsx의 상태)
      setPlayers(updatedPlayers);
      
    }, [isConnected, playerConnections]);


  // 웹소켓 연결 완료 후 타이머 정보 가져오기 위한 상태 추가
  const [isGameTimerReady, setIsGameTimerReady] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<Array<{userId: number, message: string, timestamp: string}>>([]);

  const handleChatMessage = (message: string, playerNumber: string) => {
  const playerIndex = parseInt(playerNumber) - 1;
  
  // 플레이어 메시지 업데이트
  setPlayerMessages(prev => ({
    ...prev,
    [playerIndex]: message
  }));
  
  // 5초 후 메시지 자동 제거
  setTimeout(() => {
    setPlayerMessages(prev => {
      const updated = { ...prev };
      delete updated[playerIndex];
      return updated;
    });
  }, 5000);
};

  // 웹소켓 연결 상태 및 세션 ID 유효 여부 체크
  useEffect(() => {
    if (isConnected && sessionId) {
      setIsGameTimerReady(true);
      
      // 세션 ID가 유효하면 저장
      if (sessionId && roomId) {
        console.log(`유효한 세션 ID(${sessionId})와 roomId(${roomId}) 감지됨`);
        
        // 로컬 스토리지에 세션 ID 저장
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('roomId', roomId);
      }
    } else {
      setIsGameTimerReady(false);
    }
  }, [isConnected, sessionId, roomId]);

  const {
    totalTime,
    drawTime,
    gameTimeLeft,
    setGameTimeLeft,
    isLoading: isTimerLoading,
    error: timerError
  } = useGameTimer({
    roomId: roomId ?? "",
    sessionId: sessionId || '0',
    isGameOver,
    onTimerEnd: handleGameOver
  });

  
  // 기존의 timeLeft 상태 변수 유지 (그림 그리기 시간)
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [timerPaused, setTimerPaused] = useState<boolean>(false); // 타이머 일시정지 상태 추가
  const [lastDrawTimeUpdate, setLastDrawTimeUpdate] = useState<number>(0); // drawTime 업데이트 시간 추적

  const pauseTimer = () => {
    setTimerPaused(true);
    console.log('타이머 일시정지');
  };
  
  const resumeTimer = () => {
    setTimerPaused(false);
    console.log('타이머 재시작');
  };
  const resetTimer = (newTime: number = 20) => {
    console.log(`타이머 리셋: ${newTime}초`);
    setTimeLeft(newTime);
    setTimerPaused(false);
    
    // 서버에도 타이머 리셋 요청 전송
    if (roomId && sessionId) {
      gameTimerService.resetTurnTimer(
        roomId,
        sessionId,
        {
          currentRound,
          currentDrawerIndex: activeDrawerIndex,
          newDrawTime: newTime
        }
      );
      console.log(`서버에 타이머 리셋 요청 전송: ${newTime}초`);
    }
  };

  useEffect(() => {
    if (drawTime !== undefined && drawTime >= 0) {
      console.log(`백엔드에서 받은 drawTime: ${drawTime}초`);
      
      // 현재 시간 기록
      const currentTime = Date.now();
      
      // drawTime 업데이트가 1초 이상 간격으로 들어왔거나 큰 차이가 있을 때만 적용
      if (currentTime - lastDrawTimeUpdate > 1000 || Math.abs(timeLeft - drawTime) > 2) {
        console.log(`타이머 업데이트: ${timeLeft}초 -> ${drawTime}초`);
        setTimeLeft(drawTime);
        setLastDrawTimeUpdate(currentTime);
        
        // 타이머가 0이면 일시정지 상태로 변경
        if (drawTime <= 0) {
          pauseTimer();
        } else if (timerPaused) {
          // 타이머가 0보다 크고 현재 일시정지 상태라면 재시작
          resumeTimer();
        }
      }
    }
  }, [drawTime]);

  useEffect(() => {
    // 게임이 종료됐거나 라운드 전환 중이거나 타이머가 일시정지 상태면 타이머 작동 안 함
    if (isGameOver || isRoundTransitioning || timerPaused || timeLeft <= 0) return;
    
    // 타이머 카운트다운
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = prev - 1;
        // 타이머가 0이 되면 일시정지 상태로 변경
        if (newValue <= 0) {
          clearInterval(timer);
          pauseTimer();
          return 0;
        }
        return newValue;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, isRoundTransitioning, timerPaused]);

  
  useEffect(() => {
    // console.log('현재 타이머 상태:', {
    //   totalTime,
    //   drawTime,
    //   gameTimeLeft,
    //   timeLeft,
    //   isTimerLoading
    // });
  }, [totalTime, drawTime, gameTimeLeft, timeLeft, isTimerLoading]);

  useEffect(() => {
    if (drawTime > 0) {
      // console.log('백엔드에서 받은 drawTime으로 업데이트:', drawTime, totalTime);
      setTimeLeft(drawTime);
    }
  }, [drawTime]);

  // 세션 ID 디버깅
  useEffect(() => {
    if (sessionId) {
      console.log('현재 세션 ID:', sessionId);
    }
  }, [sessionId]);
  
  // 타이머 데이터 로드 중 에러가 있으면 로그 출력
  useEffect(() => {
    if (timerError) {
      console.error('타이머 데이터 로드 오류:', timerError);
    }
  }, [timerError]);

// 수정할 코드
useEffect(() => {
  if (drawTime !== undefined && drawTime >= 0) {
    console.log(`백엔드에서 받은 drawTime: ${drawTime}초`);
    
    // 현재 시간 기록
    const currentTime = Date.now();
    
    // drawTime 업데이트가 1초 이상 간격으로 들어왔거나 큰 차이가 있을 때만 적용
    if (currentTime - lastDrawTimeUpdate > 1000 || Math.abs(timeLeft - drawTime) > 2) {
      console.log(`타이머 업데이트: ${timeLeft}초 -> ${drawTime}초`);
      setTimeLeft(drawTime);
      setLastDrawTimeUpdate(currentTime);
      
      // 타이머가 0이면 일시정지 상태로 변경
      if (drawTime <= 0) {
        pauseTimer();
      } else if (timerPaused) {
        // 타이머가 0보다 크고 현재 일시정지 상태라면 재시작
        resumeTimer();
      }
    }
  }
}, [drawTime]);


useEffect(() => {
  const currentRoomId = roomId || localStorage.getItem('roomId');
  const currentSessionId = sessionId || localStorage.getItem('sessionId');
  
  if (!currentRoomId || !currentSessionId) {
    console.log('세션 정보 구독에 필요한 정보가 없음');
    return;
  }
  
  const unsubscribe = sessionInfoService.subscribeToSessionInfo(
    currentRoomId,
    currentSessionId,
    (data) => {
      sessionInfoService.processSessionData(data, {
        setSessionInfoData,
        setWordList,
        setQuizWord,
        setDrawOrder,
        currentRound,
        wordListIndexRef // ref 전달
      });
    }
  );
  
  return () => {
    console.log('세션 정보 구독 해제');
    unsubscribe();
  };
}, [roomId, sessionId, currentRound, wordListIndexRef]);



  useEffect(() => {
    // 이미 번호가 확정된 경우 넘어감
    if (localStorage.getItem('playerNumberConfirmed') === 'true') return;
    
    // 웹소켓 연결 상태 체크
    if (!isConnected) return;
    
    // 모든 플레이어 접속 정보 확인
    const connectedPlayers = Object.entries(playerConnections)
      .filter(([_, info]) => info.isConnected)
      .map(([num]) => num);
    
    console.log("현재 접속 중인 플레이어:", connectedPlayers);
    
    // 현재 할당된 번호
    const currentNumber = localStorage.getItem('playerNumber') || "1";
    
    // 현재 번호가 이미 다른 사용자에 의해 사용 중인지 확인
    // (현재 사용자를 제외하고 동일한 번호를 사용하는 경우)
    if (connectedPlayers.includes(currentNumber) && connectedPlayers.length > 1) {
      console.log(`플레이어 번호 ${currentNumber}가 이미 사용 중입니다. 새 번호 할당...`);
      
      // 사용 가능한 플레이어 번호 목록
      const availableNumbers = ["1", "2", "3", "4"].filter(
        num => !connectedPlayers.includes(num)
      );
      
      if (availableNumbers.length > 0) {
        // 사용 가능한 번호 중 랜덤 선택
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const newNumber = availableNumbers[randomIndex];
        
        localStorage.setItem('playerNumber', newNumber);
        const newNickname = getPlayerNickname(newNumber);
        setCurrentPlayer(newNickname);
        
        console.log(`새 플레이어 번호 할당: ${newNumber}, 닉네임: ${newNickname}`);
        
        // 방에 새 플레이어 정보 알림
        sendMessage("player_update", {
          roomId: roomId,
          playerNumber: newNumber,
          nickname: newNickname
        });
      } else {
        console.log("모든 플레이어 자리가 이미 사용 중입니다.");
        // 오류 메시지 또는 대기 처리
      }
    } else {
      // 현재 번호가 사용 가능하면 확정
      localStorage.setItem('playerNumberConfirmed', 'true');
      console.log(`플레이어 번호 ${currentNumber} 확정`);
    }
  }, [isConnected, playerConnections, roomId, sendMessage]);


  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContext(ctx);
  }, []);
 
  const handlePlayerCorrectAnswer = () => {
    setEggCount(prev => prev + 1);
  };
  
  const handleAICorrectAnswer = () => {
    setEggCount(prev => Math.max(0, prev - 1));
    setAIRoundWinCount(prev => prev + 1);
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

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setIsEraser(false);
  };

  const handleEraserToggle = () => {
    setIsEraser(true);
  };

  const handleNextPlayer = () => {
    // 게임이 종료됐으면 동작하지 않음
    if (isGameOver) return;
    
    // 타이머 일시 정지
    pauseTimer();
    
    setIsDrawing(false);
    setHasCompleted(false);
  
    const nextDrawerIndex = (activeDrawerIndex + 1) % 3;
    
    // STOMP로 턴 종료 메시지 전송
    if (roomId && sessionId) {
      const initializeTurnService = async () => {
        try {
          // STOMP 클라이언트 초기화
          await turnService.initializeClient(roomId, sessionId);
          
          // 턴 종료 메시지 전송
          const success = turnService.sendTurnEnd(
            roomId, 
            sessionId, 
            currentRound, 
            activeDrawerIndex, 
            nextDrawerIndex
          );
          
          console.log('턴 종료 메시지 전송 결과:', success ? '성공' : '실패');
        } catch (error) {
          console.error('턴 종료 서비스 초기화 또는 메시지 전송 중 오류:', error);
        }
      };
      
      initializeTurnService();
    }
  
    if (nextDrawerIndex === 0) {
      // 세 번째 턴이 끝났을 때 라운드 전환 함수 호출
      transitionToNextRound();
    } else {
      // 첫 번째나 두 번째 턴이 끝났을 때는 그냥 다음 턴으로 넘어감
      setActiveDrawerIndex(nextDrawerIndex);
      // 타이머는 activeDrawerIndex 변경 감지 useEffect에서 리셋됨
    }
  };

  useEffect(() => {
    // 라운드 전환 중에는 타이머를 조작하지 않음
    if (isRoundTransitioning) return;
    
    console.log(`드로어 인덱스 변경 감지: ${activeDrawerIndex}`);
    
    // 새로운 턴이 시작될 때 타이머 리셋
    resetTimer(20);
    
    // hasCompleted 상태도 초기화
    setHasCompleted(false);
    
    // 이전 턴의 lastDrawTimeUpdate 초기화
    setLastDrawTimeUpdate(Date.now());
  }, [activeDrawerIndex, isRoundTransitioning]);


  useEffect(() => {
    // 타이머가 0보다 크거나 이미 정지 상태가 아니면 실행하지 않음
    if (timeLeft > 0 || !timerPaused || isGameOver || isRoundTransitioning) return;
    
    console.log("타이머 종료, 다음 플레이어로 전환 준비");
    
    // 다음 드로어 인덱스 계산
    const nextDrawerIndex = (activeDrawerIndex + 1) % 3;
    
    // 일정 시간 후에 다음 턴으로 전환 (상태 업데이트 안정화를 위한 지연)
    const transitionTimer = setTimeout(() => {
      if (nextDrawerIndex === 0) {
        // 세 번째 턴이 끝났을 때는 라운드 전환 함수 호출
        console.log("세 번째 턴 종료, 라운드 전환 시작");
        transitionToNextRound();
      } else {
        // 첫 번째나 두 번째 턴이 끝났을 때는 다음 턴으로 넘어감
        console.log(`턴 전환: ${activeDrawerIndex} -> ${nextDrawerIndex}`);
        
        // STOMP로 턴 종료 메시지 전송
        if (roomId && sessionId) {
          const initializeTurnService = async () => {
            try {
              // STOMP 클라이언트 초기화
              await turnService.initializeClient(roomId, sessionId);
              
              // 턴 종료 메시지 전송
              turnService.sendTurnEnd(
                roomId, 
                sessionId, 
                currentRound, 
                activeDrawerIndex, 
                nextDrawerIndex
              );
              
              console.log('턴 종료 메시지 전송 완료');
            } catch (error) {
              console.error('턴 종료 서비스 초기화 또는 메시지 전송 중 오류:', error);
            }
          };
          
          initializeTurnService();
        }
        
        setActiveDrawerIndex(nextDrawerIndex);
      }
    }, 800); // 0.8초 지연
    
    return () => clearTimeout(transitionTimer);
  }, [timeLeft, timerPaused, isGameOver, isRoundTransitioning, activeDrawerIndex]);

const transitionToNextRound = () => {
  // 라운드 전환 시작을 표시
  setIsRoundTransitioning(true);

  setTimeLeft(0);

  // 3초 뒤에 실행 (RoundTransition 모달의 카운트다운 시간과 일치)
  setTimeout(() => {
    setCurrentRound(prev => prev + 1);
    setGuesserIndex((prev) => (prev + 1) % 4);
    setActiveDrawerIndex(0);
    
    // 캔버스 초기화
    if (context && canvasRef.current) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // 웹소켓으로 받아온 wordList 사용
    if (wordList.length > 0) {
      // 현재 라운드에 맞는 인덱스 계산 (0부터 시작)
      const wordIndex = currentRound;
      
      if (wordIndex >= 0 && wordIndex < wordList.length) {
        setQuizWord(wordList[wordIndex]);
        console.log(`라운드 ${currentRound}의 선택된 단어:`, wordList[wordIndex]);
      } else {
        // 단어 리스트를 초과하는 경우 처리 (예: 랜덤 단어 선택 또는 기본값)
        console.warn(`단어 리스트 인덱스 초과: ${wordIndex}`);
        setQuizWord(wordList[0]); // 기본적으로 첫 번째 단어로 돌아감
      }
    } else {
      console.warn('단어 리스트가 비어있습니다.');
    }
    
    // 상태 초기화
    setHasCompleted(false);
    setGuessSubmitCount(0);
    setShowCorrectAnswer(false);

    setTimeLeft(20);

    // 라운드 전환 완료 표시
    setIsRoundTransitioning(false);
    
    // 여기에서 타이머 리셋 호출 (모달이 사라지는 시점)
    if (sessionId) {
      gameTimerService.resetTurnTimer(
        roomId ?? '',
        sessionId,
        {
          currentRound: currentRound + 1,
          currentDrawerIndex: 0,
          newDrawTime: 20
        }
      );
      console.log('라운드 전환 후 타이머 리셋 요청 완료');
    }
  }, 3000);
};


const handleGuessSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isGameOver) return;
  
  if (!playerPermissions.canGuess || !playerPermissions.canAnswer) {
    alert('현재 정답을 맞출 수 없습니다.');
    return;
  }

  // 제출 횟수가 최대치에 도달했으면 더 이상 제출 불가
  if (guessSubmitCount >= MAX_GUESS_SUBMIT_COUNT) {
    setAiAnswer('제출 횟수를 모두 사용했습니다.');
    return;
  }

  if (!guess || guess.trim() === '') {
    alert('정답을 입력해주세요!');
    return;
  }
  
  // 제출 횟수 증가
  setGuessSubmitCount(prev => prev + 1);

  // 현재 사용자 정보 가져오기
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // memberId 또는 id 우선순위로 가져오기
  const userId = parseInt(currentUser.memberId || currentUser.id || '0');
  const nickname = currentUser.nickname || '플레이어';
  
  // 웹소켓으로 입력된 메시지 전송 (정답 여부와 상관없이)
  if (roomId && sessionId) {
    // 예시와 동일한 형식으로 메시지 객체 생성 및 로깅
    const messageObj = {
      "userId": userId, // 동적으로 할당된 userId
      "message": guess,
      "createdAt": new Date().toISOString()
    };
    
    // 예시와 동일한 형식으로 콘솔에 출력
    console.log(JSON.stringify(messageObj, null, 2));
    
    // 메시지 전송
    chatService.sendMessage(roomId, sessionId, userId, guess);
    
    // 사용자 콘솔 로그
    console.log(`사용자 ${userId}(${nickname})가 메시지를 전송: ${guess}`);
    
    // 플레이어 메시지 상태 업데이트 (자신의 메시지도 말풍선으로 표시)
    setPlayerMessages(prev => {
      const updated = {
        ...prev,
        [nickname]: guess
      };
      console.log('업데이트된 playerMessages:', updated);
      return updated;
    });
    
    // 5초 후 메시지 자동 제거
    setTimeout(() => {
      setPlayerMessages(prev => {
        const updated = { ...prev };
        delete updated[nickname];
        return updated;
      });
    }, 5000);

    // 로컬에서 정답 여부 확인
    if (guess.trim().toLowerCase() === quizWord.toLowerCase()) {
      // 플레이어 정답 처리
      handlePlayerCorrectAnswer();
      
      // 데이터 계산 및 로깅 (STOMP 연결 여부와 상관없이 항상 실행)
      if (roomId && sessionId) {
        // 현재 활성화된(초록색 테두리) 플레이어의 ID 사용
        const drawingMemberId = activePlayerId;
        
        // 정답을 맞춘 사람의 ID
        const answerMemberId = userId;
        
        // 현재 그림 그리는 순서 (1, 2, 3 중 하나)
        const drawingOrder = activeDrawerIndex + 1;
        
        // 이제 STOMP로 전송 시도
        try {
          // STOMP 클라이언트 초기화 시도 (연결되어 있지 않을 경우)
          await correctAnswerService.initializeClient(roomId, sessionId);
          
          // 정답 정보 전송
          const success = correctAnswerService.sendCorrectAnswer(
            roomId,
            sessionId,
            drawingMemberId,
            answerMemberId,
            drawingOrder
          );
        } catch (error) {
          console.error('정답 정보 전송 중 오류:', error);
        }
      }
    } else {
      // 오답 처리
      alert('틀렸습니다! 다시 시도해보세요.');
    }
  }
  
  setGuess('');
};

useEffect(() => {
  // roundResult가 존재하고, 게임이 진행 중일 때만 처리
  if (roundResult && !isGameOver && !isRoundTransitioning) {
    console.log('라운드 결과에 따른 라운드 전환 시도:', roundResult);

    // 팀 점수 업데이트
    if (roundResult.isWin) {
      // 사람 팀 승리 (true)
      setHumanRoundWinCount(prev => prev + 1);
      console.log(`라운드 ${roundResult.round}에서 사람 팀 승리!`);
    } else {
      // AI 팀 승리 (false)
      setAIRoundWinCount(prev => prev + 1);
      console.log(`라운드 ${roundResult.round}에서 AI 팀 승리!`);
    }

    // 라운드 전환 함수 호출
    // 사람이든 AI든 라운드 전환 로직은 동일하게 처리
    transitionToNextRound();

    // 라운드 결과 상태 초기화 (무한 루프 방지)
    setRoundResult(null);
  }
}, [roundResult, isGameOver, isRoundTransitioning]);

useEffect(() => {
  // 웹소켓이 연결되고 세션 ID가 있을 때만 실행
  if (!sessionId || !roomId) return;
  
  // 비동기 함수를 즉시 실행하는 패턴
  let unsubscribe: (() => void) | null = null;

  const initChatService = async () => {
    try {
      await chatService.initializeClient(roomId, sessionId);
      // console.log('채팅 서비스 초기화 완료');
      
      // 단일 메시지 구독
      unsubscribe = chatService.subscribeToMessages(
        roomId,
        sessionId,
        (message) => {
          // console.group('🎮 게임 메시지 처리');
          // console.log('수신된 메시지:', message);
          
          // AI 메시지 확인 (userId가 -1인 경우)
          const isAIMessage = message.senderId === -1;
          
          // 메시지를 플레이어 메시지에 추가 (AI 메시지는 특별히 처리)
          setPlayerMessages(prev => {
            const updated = {
              ...prev,
              [isAIMessage ? 'ai' : message.senderId]: message.message
            };
            // console.log('업데이트된 playerMessages:', updated);
            return updated;
          });
          
          // 5초 후 메시지 자동 제거
          setTimeout(() => {
            setPlayerMessages(prev => {
              const updatedMessages = { ...prev };
              delete updatedMessages[isAIMessage ? 'ai' : message.senderId];
              return updatedMessages;
            });
          }, 5000);
          
          console.groupEnd();
        }
      );
    } catch (error) {
      // console.error('채팅 서비스 초기화 실패:', error);
    }
  };
  
  // 즉시 실행 함수
  initChatService();

  // 컴포넌트 언마운트 시 정리
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [isConnected, sessionId, roomId]);

const handlePass = () => {
  if (isGameOver) return;

  // 조건 수정: 순서3(activeDrawerIndex === 2)이고 전체 PASS 횟수가 3회 미만일 때
  if (activeDrawerIndex === 2 && passCount < MAX_PASS_COUNT) {
    setAIRoundWinCount(prev => prev + 1);      
    setPassCount(prev => prev + 1);
    setEggCount(prev => Math.max(0, prev - 1));
    
    // STOMP로 턴 종료 메시지 전송
    if (roomId && sessionId) {
      const initializeTurnService = async () => {
        try {
          // STOMP 클라이언트 초기화
          await turnService.initializeClient(roomId, sessionId);
          
          // 턴 종료 메시지 전송 (다음 턴은 0번 인덱스)
          const success = turnService.sendTurnEnd(
            roomId, 
            sessionId, 
            currentRound, 
            activeDrawerIndex, 
            0 // 세 번째 턴 후에는 다시 첫 번째 턴으로
          );
          
          // console.log('턴 종료 메시지 전송 결과:', success ? '성공' : '실패');
        } catch (error) {
          // console.error('턴 종료 서비스 초기화 또는 메시지 전송 중 오류:', error);
        }
      };
      
      initializeTurnService();
    }
    
    // 라운드 전환 함수 호출
    transitionToNextRound();
  }
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
    formData.append("quizWord", quizWord);
  
    try {
      const response = await axios.post("http://34.64.180.197:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("전체 응답 데이터:", response.data);
  
      const aiMessage = response.data.result;
      
      // AI 메시지 객체 생성 (플레이어 메시지와 동일한 형식)
      const aiMessageObj = {
        "userId": -1, // AI의 고정된 userId
        "message": aiMessage,
        "createdAt": new Date().toISOString()
      };
      
      // 메시지 객체를 JSON 문자열로 로깅 (플레이어 메시지와 동일한 형식)
      console.log(JSON.stringify(aiMessageObj, null, 2));
      
      // 웹소켓으로 AI 메시지 전송
      if (roomId && sessionId) {
        chatService.sendMessage(roomId, sessionId, -1, aiMessage);
        
        // AI 메시지 상태 업데이트 (플레이어 메시지와 유사한 방식)
        setPlayerMessages(prev => {
          const updated = {
            ...prev,
            'ai': aiMessage
          };
          console.log('업데이트된 AI playerMessages:', updated);
          return updated;
        });
        
        // 5초 후 AI 메시지 자동 제거
        setTimeout(() => {
          setPlayerMessages(prev => {
            const updated = { ...prev };
            delete updated['ai'];
            return updated;
          });
        }, 5000);
      }
  
      // 기존 예측 상태 업데이트
      setPredictions({
        result: response.data.result,
        correct: response.data.correct,
      });
  
      // AI가 정답을 맞췄다면 처리
      if (response.data.correct) {
        handleAICorrectAnswer();
      }
  
      return { result: response.data.result, correct: response.data.correct };
    } catch (error) {
      console.error("예측 요청 실패:", error);
      throw error;
    }
  };

// 그림 그리기 타이머 효과 - 개선된 버전
useEffect(() => {
  // 게임이 종료됐거나 라운드 전환 중이거나 타이머가 일시정지 상태면 타이머 작동 안 함
  if (isGameOver || isRoundTransitioning || timerPaused || timeLeft <= 0) return;
  
  // 타이머 카운트다운
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      const newValue = prev - 1;
      // 타이머가 0이 되면 일시정지 상태로 변경
      if (newValue <= 0) {
        clearInterval(timer);
        pauseTimer();
        return 0;
      }
      return newValue;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, [timeLeft, isGameOver, isRoundTransitioning, timerPaused]);

useEffect(() => {
  // roomId와 sessionId가 있고, 웹소켓 연결이 완료되었을 때만 실행
  if (!roomId || !sessionId || !isConnected) return;

  // 구독 취소 함수를 저장할 변수
  let unsubscribeFunc: (() => void) | null = null;

  // 클라이언트 초기화 먼저 시도
  const initializeAndSubscribe = async () => {
    try {
      // 클라이언트 초기화 
      await correctAnswerService.initializeClient(roomId, sessionId);

      // 라운드 결과 구독 설정
      unsubscribeFunc = correctAnswerService.subscribeToRoundResult(
        roomId, 
        sessionId, 
        (result) => {
          console.log('라운드 결과 수신:', result);
          
          // 라운드 결과 상태 업데이트
          setRoundResult(result);
        }
      );
    } catch (error) {
      console.error('라운드 결과 구독 초기화 중 오류:', error);
    }
  };

  // 비동기 함수 호출
  initializeAndSubscribe();

  // 클린업 함수 반환
  return () => {
    if (unsubscribeFunc) {
      unsubscribeFunc();
    }
  };
}, [roomId, sessionId, isConnected]);

useEffect(() => {
  if (isConnected && sessionId) {
    console.log('웹소켓 연결 상태:', isConnected);
    console.log('현재 세션 ID:', sessionId);
    console.log('현재 플레이어 연결 정보:', playerConnections);
  }
}, [isConnected, sessionId, playerConnections]);

  
  // 게임 시간 포맷 함수
  const formatGameTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}분${remainingSeconds.toString().padStart(2, '0')}초`;
  };

  const currentDrawerIndex = calculateCurrentDrawerPlayerIndex();
  const currentDrawer = players[currentDrawerIndex];
  



  // return 부분만 CSS 스타일을 변경한 코드입니다
  return (
    <div className="relative w-full min-h-screen bg-amber-50">
      {/* 게임 종료 모달 */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-amber-100 rounded-xl p-8 text-center border-4 border-amber-600 shadow-[5px_5px_0_0_rgba(0,0,0,0.3)] max-w-2xl w-full">
            <h2 className="text-4xl font-bold mb-6 text-amber-800">게임 종료!</h2>
            <div className="text-2xl mb-6">
              <p className="mb-4">최종 점수</p>
              <div className="flex justify-center items-center gap-8 bg-white p-4 rounded-lg border-4 border-amber-400 shadow-inner">
                <div className="text-blue-700 font-bold text-3xl">병아리: {humanRoundWinCount}</div>
                <div className="text-2xl">VS</div>
                <div className="text-red-700 font-bold text-3xl">담비(AI): {aiRoundWinCount}</div>
              </div>
            </div>
            <p className="text-lg mt-6">
              {humanRoundWinCount > aiRoundWinCount 
                ? '축하합니다! 병아리리팀이 이겼습니다!' 
                : humanRoundWinCount < aiRoundWinCount 
                  ? '담비(AI)가가 이겼습니다. 다음 기회에...' 
                  : '동점입니다! 좋은 승부였습니다!'}
            </p>

            <button 
              onClick={() => navigate(`/result/${roomId}`)} 
              className="mt-6 w-full py-3 bg-red-500 rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 text-white font-bold transition-all duration-200"
            >
              게임 종료
            </button>
          </div>
        </div>
      )}
      
      {/* 라운드 전환 컴포넌트 */}
      <RoundTransition 
        isVisible={isRoundTransitioning} 
        currentRound={currentRound} 
        nextRound={currentRound + 1} 
      />
      
      {/* 배경 이미지 */}
      <div className="fixed inset-0 w-full h-full z-0">
        <img 
          className="w-full h-full object-cover"
          src="/images/2727.jpg" 
          alt="닭장 배경"
        />
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-800/50"></div>
      </div>
      
      {/* 컨텐츠 컨테이너 */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto p-4 sm:p-6">
        {/* 게임 정보 헤더 */}
      

      

      <div className=" items-center w-full max-w-7xl mb-4">
        {/* 금속 체인이 있는 나무 판자 */}
        <div className="relative flex justify-center items-center">
          {/* 왼쪽 금속 체인 */}
          <svg width="30" height="55" viewBox="0 0 30 55" className="absolute -top-12 left-8" xmlns="http://www.w3.org/2000/svg">
            {/* 천장에 고정된 금속 후크 */}
            <path d="M15,0 L15,2 Q18,2 18,5 L18,8 Q15,8 15,11 L15,14" 
                  stroke="#888888" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* 금속 체인 링크들 */}
            <defs>
              {/* 금속 그라데이션 */}
              <linearGradient id="metalGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DEDEDE" />
                <stop offset="50%" stopColor="#888888" />
                <stop offset="100%" stopColor="#555555" />
              </linearGradient>
              
              {/* 반짝이는 효과 */}
              <linearGradient id="shineLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* 첫 번째 링크 */}
            <ellipse cx="15" cy="18" rx="4" ry="6" fill="url(#metalGradientLeft)" stroke="#444444" strokeWidth="0.5" />
            <ellipse cx="15" cy="18" rx="2" ry="3" fill="none" stroke="url(#shineLeft)" strokeWidth="0.8" opacity="0.5" />
            
            {/* 두 번째 링크 */}
            <ellipse cx="15" cy="28" rx="4" ry="6" fill="url(#metalGradientLeft)" stroke="#444444" strokeWidth="0.5" />
            <ellipse cx="15" cy="28" rx="2" ry="3" fill="none" stroke="url(#shineLeft)" strokeWidth="0.8" opacity="0.5" />
            
            {/* 세 번째 링크 */}
            <ellipse cx="15" cy="38" rx="4" ry="6" fill="url(#metalGradientLeft)" stroke="#444444" strokeWidth="0.5" />
            <ellipse cx="15" cy="38" rx="2" ry="3" fill="none" stroke="url(#shineLeft)" strokeWidth="0.8" opacity="0.5" />
            
            {/* 나무 판자에 부착된 고리 */}
            <path d="M15,44 C18,44 20,46 20,48 C20,50 18,52 15,52 C12,52 10,50 10,48 C10,46 12,44 15,44 Z" 
                  fill="#666666" stroke="#444444" strokeWidth="0.5" />
            <path d="M13,46 C15,46 17,46 17,48 C17,50 15,50 15,50" 
                  fill="none" stroke="#DDDDDD" strokeWidth="0.5" opacity="0.6" />
          </svg>
          
          {/* 오른쪽 금속 체인 */}
          <svg width="30" height="55" viewBox="0 0 30 55" className="absolute -top-12 right-8" xmlns="http://www.w3.org/2000/svg">
            {/* 천장에 고정된 금속 후크 */}
            <path d="M15,0 L15,2 Q18,2 18,5 L18,8 Q15,8 15,11 L15,14" 
                  stroke="#888888" strokeWidth="3" fill="none" strokeLinecap="round" />
            
            {/* 금속 체인 링크들 */}
            <defs>
              {/* 금속 그라데이션 */}
              <linearGradient id="metalGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DEDEDE" />
                <stop offset="50%" stopColor="#888888" />
                <stop offset="100%" stopColor="#555555" />
              </linearGradient>
              
              {/* 반짝이는 효과 */}
              <linearGradient id="shineRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* 첫 번째 링크 */}
            <ellipse cx="15" cy="18" rx="4" ry="6" fill="url(#metalGradientRight)" stroke="#444444" strokeWidth="0.5" />
            <ellipse cx="15" cy="18" rx="2" ry="3" fill="none" stroke="url(#shineRight)" strokeWidth="0.8" opacity="0.5" />
            
            {/* 두 번째 링크 */}
            <ellipse cx="15" cy="28" rx="4" ry="6" fill="url(#metalGradientRight)" stroke="#444444" strokeWidth="0.5" />
            <ellipse cx="15" cy="28" rx="2" ry="3" fill="none" stroke="url(#shineRight)" strokeWidth="0.8" opacity="0.5" />
            
            {/* 세 번째 링크 */}
            <ellipse cx="15" cy="38" rx="4" ry="6" fill="url(#metalGradientRight)" stroke="#444444" strokeWidth="0.5" />
            <ellipse cx="15" cy="38" rx="2" ry="3" fill="none" stroke="url(#shineRight)" strokeWidth="0.8" opacity="0.5" />
            
            {/* 나무 판자에 부착된 고리 */}
            <path d="M15,44 C18,44 20,46 20,48 C20,50 18,52 15,52 C12,52 10,50 10,48 C10,46 12,44 15,44 Z" 
                  fill="#666666" stroke="#444444" strokeWidth="0.5" />
            <path d="M13,46 C15,46 17,46 17,48 C17,50 15,50 15,50" 
                  fill="none" stroke="#DDDDDD" strokeWidth="0.5" opacity="0.6" />
          </svg>
  {/* 실제 나무 색상에 가까운 나무판자 */}
<div className="flex justify-center items-center p-2.5 bg-[#e3a95c] rounded-xl px-1 py-5 border-4 border-[#d68e46] shadow-[5px_5px_0_0_rgba(0,0,0,0.3)] w-full">
  <div className="flex items-center w-full justify-between relative">
    {/* 나뭇결 효과 - 실제 나무결과 유사한 패턴 */}
    <div className="absolute inset-0 opacity-20">
      <div className="w-full h-[2px] bg-[#8b4513] rounded-full mt-2" style={{ transform: 'rotate(0.2deg)' }}></div>
      <div className="w-[97%] h-[1px] bg-[#8b4513] rounded-full mt-5 ml-3" style={{ transform: 'rotate(-0.1deg)' }}></div>
      <div className="w-[95%] h-[1px] bg-[#8b4513] rounded-full mt-9 ml-5" style={{ transform: 'rotate(0.1deg)' }}></div>
      <div className="w-[96%] h-[2px] bg-[#8b4513] rounded-full mt-13 ml-2" style={{ transform: 'rotate(-0.2deg)' }}></div>
      {/* <div className="w-[98%] h-[1px] bg-[#8b4513] rounded-full mt-17 ml-1" style={{ transform: 'rotate(0.15deg)' }}></div>
      <div className="w-[94%] h-[2px] bg-[#8b4513] rounded-full mt-20 ml-4" style={{ transform: 'rotate(-0.1deg)' }}></div>
      <div className="w-[99%] h-[1px] bg-[#8b4513] rounded-full mt-24 ml-0" style={{ transform: 'rotate(0.05deg)' }}></div> */}
      
      {/* 나무 옹이 효과 */}
      <div className="absolute w-6 h-6 rounded-full bg-[#8b5a2b] opacity-10 top-12 left-16"></div>
      <div className="absolute w-4 h-4 rounded-full bg-[#8b5a2b] opacity-10 bottom-6 right-24"></div>
    </div>
    
    {/* 실제 콘텐츠 */}
    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#5d4037] whitespace-nowrap pl-4 sm:pl-10">
      ROUND {currentRound}
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="text-right text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600">
        병아리 {humanRoundWinCount}
      </div>
      
      {/* 나무 판자 배경 */}
      <div className="relative bg-amber-800 rounded-xl px-8 py-5 border-4 border-amber-900 shadow-[5px_5px_0_0_rgba(0,0,0,0.3)] min-w-[180px] sm:min-w-[220px]">
        {/* 나뭇결 효과 - 불규칙한 나무 무늬 패턴 */}
        <div className="absolute inset-0 opacity-15">
          <div className="w-full h-[2px] bg-amber-950 rounded-full mt-2" style={{ transform: 'rotate(0.7deg)' }}></div>
          <div className="w-[95%] h-[2px] bg-amber-950 rounded-full mt-6 ml-2" style={{ transform: 'rotate(-0.8deg)' }}></div>
          <div className="w-[98%] h-[2px] bg-amber-950 rounded-full mt-10 ml-1" style={{ transform: 'rotate(0.4deg)' }}></div>
          {/* <div className="w-[94%] h-[2px] bg-amber-950 rounded-full mt-14 ml-3" style={{ transform: 'rotate(-0.1deg)' }}></div> */}
          
          {/* 작은 옹이 효과 */}
          <div className="absolute w-3 h-3 rounded-full bg-[#5d4037] opacity-20 top-3 right-5"></div>
        </div>
        
        {/* 제시어 텍스트 */}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-6xl sm:text-6xl md:text-4xl font-bold text-[#f5f5dc] drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] text-center">
            {/* {playerPermissions.canSeeWord ? quizWord : '???'}
             */}
             {quizWord}
          </h1>
        </div>
        
        {/* 못 효과 */}
        <div className="absolute -top-2 left-10 w-4 h-4 rounded-full bg-[#696969] border border-[#4d4d4d]" 
            style={{ boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), 1px 1px 1px rgba(0,0,0,0.5)' }}></div>
        <div className="absolute -top-2 right-10 w-4 h-4 rounded-full bg-[#696969] border border-[#4d4d4d]"
            style={{ boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), 1px 1px 1px rgba(0,0,0,0.5)' }}></div>
        <div className="absolute -bottom-2 left-6 w-4 h-4 rounded-full bg-[#696969] border border-[#4d4d4d]"
            style={{ boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), 1px 1px 1px rgba(0,0,0,0.5)' }}></div>
        <div className="absolute -bottom-2 right-6 w-4 h-4 rounded-full bg-[#696969] border border-[#4d4d4d]"
            style={{ boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), 1px 1px 1px rgba(0,0,0,0.5)' }}></div>
      </div>
      
      <div className="text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-red-600">
        {aiRoundWinCount} 담비
      </div>
    </div>
    
    <div className="bg-[#f5f5dc] px-3 sm:px-6 py-1 rounded-full border-2 sm:border-4 border-[#d2b48c] text-base sm:text-xl font-bold shadow-md mr-2 sm:mr-5">
      남은 시간: {formatGameTime(gameTimeLeft)}
    </div>
  </div>
</div>
</div>
</div>

        <div className="flex w-full max-w-7xl gap-4 ">
          {/* 플레이어 컴포넌트 - 좌측 */}
          <div className="bg-amber-100 rounded-xl h-[600px] border-4 border-amber-600 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] p-4">
          <PlayerSection
              currentRound={currentRound}
              activeDrawerIndex={activeDrawerIndex}
              guesserIndex={guesserIndex}
              roomId={roomId || undefined}
              playerConnections={playerConnections as any}
              isConnected={isConnected}
              playerMessages={playerMessages}
              paredUser={paredUser}
              storedPlayersList={storedPlayersList}
              onPlayerRoleChange={handlePlayerRoleChange}
              onActivePlayerChange={handleActivePlayerChange} // 새로운 prop 전달

            />
          </div>

          {/* 캔버스 컴포넌트 - 중앙 */}
          <div className="w-3/5">
            <div className="bg-amber-100 rounded-xl h-[600px] border-4 border-amber-600 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] p-4">
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
                roomId={roomId ?? ""}
                sessionId={sessionId ?? ""}
                canDraw={playerPermissions.canDraw}
                timeLeft={timeLeft}
                gameTimeLeft={gameTimeLeft}
              />
            </div>
          </div>

          {/* AI 컴포넌트 - 우측 */}
          <div className="w-1/5">
            <div className="bg-amber-100 h-[600px] rounded-xl border-4 border-amber-600 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] p-4">
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
              canPass={activeDrawerIndex === 2 && passCount < MAX_PASS_COUNT}
              passCount={passCount}
              isHumanCorrect={isHumanCorrect}
              setIsHumanCorrect={setIsHumanCorrect}
              isEmptyGuess={isEmptyGuess}
              setIsEmptyGuess={setIsEmptyGuess}
              isWrongGuess={isWrongGuess}
              setIsWrongGuess={setIsWrongGuess}
              guessSubmitCount={guessSubmitCount}
              maxGuessSubmitCount={MAX_GUESS_SUBMIT_COUNT}
              canAnswer={playerPermissions.canAnswer}
              playerMessages={playerMessages} // AI 메시지 표시를 위해 추가
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default Game;