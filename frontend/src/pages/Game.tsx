import React, { useState, useRef, useEffect } from 'react';
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

interface Player {
  id: number;
  name: string;
  level: number;
  avatar: string;
}

const Game: React.FC = () => {
  // URL에서 roomId 파라미터 가져오기
  const params = useParams<{ roomId?: string }>();
  const roomId = '67e3b8c70e25f60ac596bd83';
  const navigate = useNavigate();
  
  const [passCount, setPassCount] = useState<number>(0);
  const MAX_PASS_COUNT = 3;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // roomId가 없으면 기본 방으로 리다이렉트
  useEffect(() => {
    if (!roomId) {
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
  const [quizWord, setQuizWord] = useState<string>('바나나');
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
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

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
  
  const [predictions, setPredictions] = useState<{ class: string; probability: number }[]>([]);

  // 웹소켓 훅 사용
  const { isConnected, playerConnections, sessionId, sendMessage } = useGameWebSocket({
    roomId,
    currentPlayer
  });
  
  // 웹소켓 연결 완료 후 타이머 정보 가져오기 위한 상태 추가
  const [isGameTimerReady, setIsGameTimerReady] = useState<boolean>(false);

  // 웹소켓 연결 상태 및 세션 ID 유효 여부 체크
  useEffect(() => {
    if (isConnected && sessionId) {
      setIsGameTimerReady(true);
    } else {
      setIsGameTimerReady(false);
    }
  }, [isConnected, sessionId]);

  const {
    totalTime,
    drawTime,
    gameTimeLeft,
    setGameTimeLeft,
    isLoading: isTimerLoading,
    error: timerError
  } = useGameTimer({
    roomId,
    sessionId: sessionId || '0',
    isGameOver
  });

  
  // 기존의 timeLeft 상태 변수 유지 (그림 그리기 시간)
  const [timeLeft, setTimeLeft] = useState<number>(20);

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

  useEffect(() => {
  // drawTime이 유효한 값(0 포함)일 때만 업데이트
  if (drawTime !== undefined) {
    // console.log('🕒 drawTime으로 timeLeft 업데이트:', drawTime);
    setTimeLeft(drawTime);
  }
}, [drawTime]);

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
    
    setIsDrawing(false);
    setHasCompleted(false);
  
    const nextDrawerIndex = (activeDrawerIndex + 1) % 3;
    
    if (nextDrawerIndex === 0) {
      // 세 번째 턴이 끝났을 때 라운드 전환 함수 호출
      transitionToNextRound();
    } else {
      // 첫 번째나 두 번째 턴이 끝났을 때는 그냥 다음 턴으로 넘어감
      setActiveDrawerIndex(nextDrawerIndex);
      setTimeLeft(20);
    }
  };

const transitionToNextRound = () => {
  // 라운드 전환 시작을 표시
  setIsRoundTransitioning(true);
  
  // 3초 뒤에 실행 (RoundTransition 모달의 카운트다운 시간과 일치)
  setTimeout(() => {
    setCurrentRound(prev => prev + 1);
    setGuesserIndex((guesserIndex + 1) % 4);
    setActiveDrawerIndex(0);
    
    // 캔버스 초기화
    if (context && canvasRef.current) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // 새 퀴즈 단어 설정
    const newWords = ['사과', '자동차', '컴퓨터', '강아지', '고양이', '비행기', '꽃', '커피'];
    setQuizWord(newWords[Math.floor(Math.random() * newWords.length)]);
    
    // 상태 초기화
    setHasCompleted(false);
    setGuessSubmitCount(0);
    setShowCorrectAnswer(false);
    
    // 라운드 전환 완료 표시
    setIsRoundTransitioning(false);
    
    // 여기에서 타이머 리셋 호출 (모달이 사라지는 시점)
    if (sessionId) {
      gameTimerService.resetTurnTimer(
        roomId,
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

const handleGuessSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (isGameOver) return;

  // 제출 횟수가 최대치에 도달했으면 더 이상 제출 불가
  if (guessSubmitCount >= MAX_GUESS_SUBMIT_COUNT) {
    setAiAnswer('제출 횟수를 모두 사용했습니다.');
    return;
  }

  if (!guess || guess.trim() === '') {
    console.log('빈 입력값 감지됨');
    setIsEmptyGuess(true);
    return;
  }
    
  // 제출 횟수 증가
  setGuessSubmitCount(prev => prev + 1);

  if (guess.trim().toLowerCase() === quizWord.toLowerCase()) {
    handlePlayerCorrectAnswer();
    setIsHumanCorrect(true);
    setHumanRoundWinCount(prev => prev + 1);
    
    // 라운드 전환 함수 호출
    transitionToNextRound();
  } else {
    setIsWrongGuess(true);
    setAiAnswer('틀렸습니다! 다시 시도해보세요.');
  }
  
  setGuess('');
};

const handlePass = () => {
  if (isGameOver) return;

  // 조건 수정: 순서3(activeDrawerIndex === 2)이고 전체 PASS 횟수가 3회 미만일 때
  if (activeDrawerIndex === 2 && passCount < MAX_PASS_COUNT) {
    setAIRoundWinCount(prev => prev + 1);      
    setPassCount(prev => prev + 1);
    setEggCount(prev => Math.max(0, prev - 1));
    
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
// 그림 그리기 타이머 효과 - 개선된 버전
useEffect(() => {
  // 게임이 종료됐거나 라운드 전환 중이면 타이머를 멈춤
  if (isGameOver || isRoundTransitioning) return;

  if (timeLeft <= 0) {
    const nextDrawerIndex = (activeDrawerIndex + 1) % 3;

    if (nextDrawerIndex === 0) {
      // 세 번째 턴이 끝났을 때는 라운드 전환 함수 호출
      transitionToNextRound();
    } else {
      // 첫 번째나 두 번째 턴이 끝났을 때는 그냥 다음 턴으로 넘어감
      setActiveDrawerIndex(nextDrawerIndex);
      setTimeLeft(20);
      setHasCompleted(false);
    }
    return;
  }

  // 라운드 전환 중이 아닐 때만 타이머 작동
  const timer = setInterval(() => {
    setTimeLeft(prev => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, context, guesserIndex, activeDrawerIndex, isRoundTransitioning, isGameOver]);

  
  // 게임 시간 포맷 함수
  const formatGameTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}분${remainingSeconds.toString().padStart(2, '0')}초`;
  };

  const currentDrawerIndex = calculateCurrentDrawerPlayerIndex();
  const currentDrawer = players[currentDrawerIndex];



  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-cover bg-[url('/backgrounds/wooden-bg.jpg')] px-[150px] py-4 box-border flex-col">
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-yellow-100 rounded-xl p-8 text-center border-4 border-yellow-500 shadow-lg max-w-2xl w-full">
            <h2 className="text-4xl font-bold mb-6 text-yellow-800">게임 종료!</h2>
            <div className="text-2xl mb-6">
              <p className="mb-4">최종 점수</p>
              <div className="flex justify-center items-center gap-8 bg-white p-4 rounded-lg shadow-inner">
                <div className="text-blue-700 font-bold text-3xl">사람: {humanRoundWinCount}</div>
                <div className="text-2xl">VS</div>
                <div className="text-red-700 font-bold text-3xl">AI: {aiRoundWinCount}</div>
              </div>
            </div>
            <p className="text-lg mt-6">
              {humanRoundWinCount > aiRoundWinCount 
                ? '축하합니다! 사람팀이 이겼습니다!' 
                : humanRoundWinCount < aiRoundWinCount 
                  ? 'AI팀이 이겼습니다. 다음 기회에...' 
                  : '동점입니다! 좋은 승부였습니다!'}
            </p>

            <button 
              onClick={() => navigate('/game-record')} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl shadow-md transition-colors duration-300"
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
            
            <div>
              사람 {humanRoundWinCount} : {aiRoundWinCount} AI
            </div>
            <div className="flex-1 text-right pr-10">
              <div className="text-lg text-gray-700 text-5xl">
                {/* 남은시간: {isTimerLoading ? '로딩 중...' : `${timeLeft}초`}
                 */}
                     남은시간: {timeLeft}초

              </div>
            </div>
            <div className="bg-yellow-100 px-6 py-1 rounded-full border-2 border-yellow-400 text-xl font-bold shadow-md">
              남은 시간: {formatGameTime(gameTimeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-7xl">
        {/* 플레이어 컴포넌트 - 좌측 */}
        <div className="w-1/5 mr-9">
          <PlayerSection 
            currentRound={currentRound}
            activeDrawerIndex={activeDrawerIndex}
            guesserIndex={guesserIndex}
            roomId={roomId}
            playerConnections={playerConnections as any} // 타입 단언 사용
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
          setHasCompleted={setHasCompleted} // 이 함수를 통해 그림 지운 후 다시 그리기 가능
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
          roomId={roomId}  // 추가
          sessionId={sessionId}  // 추가
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
        />
        </div>
      </div>
    </div>
  );
};

export default Game;