import React, { useState, useRef, useEffect } from 'react';
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

const Game: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: 'Player 1', level: 1, avatar: '/avatars/chick.png' },
    { id: 1, name: 'Player 2', level: 50, avatar: '/avatars/muscular.png' },
    { id: 2, name: 'Player 3', level: 25, avatar: '/avatars/angry-bird.png' },
    { id: 3, name: 'Player 4', level: 16, avatar: '/avatars/yellow-bird.png' },
  ]);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [quizWord, setQuizWord] = useState<string>('바나나');
  const [timeLeft, setTimeLeft] = useState<number>(20); // 기존 60에서 20으로 변경
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

  const [predictions, setPredictions] = useState<{ class: string; probability: number }[]>([]); // 예측 정보 상태

  const handlePlayerCorrectAnswer = () => {
    setEggCount(prev => prev + 1);
  };
  
  const handleAICorrectAnswer = () => {
    setEggCount(prev => Math.max(0, prev - 1)); // 0 미만으로 내려가지 않도록 방지
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
        
        // 모든 플레이어가 그림을 그렸을 때 라운드 종료
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
        
        // 타이머를 20초로 리셋하고, 그리기 완료 상태 초기화
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
  
  // 타이머를 20초로 리셋
  setTimeLeft(20);

  // 모든 플레이어가 그림을 그렸을 때 라운드 종료
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
        
        // 라운드 및 그리는 플레이어 초기화
        setCurrentRound(prev => prev + 1);
        setGuesserIndex((guesserIndex + 1) % 4);
        setActiveDrawerIndex(0);
        
        // 타이머를 20초로 고정
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
    
    // 타이머를 20초로 고정
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

  // 자식 컴포넌트에 연결할 fastapi - 이미지 전송하고 예측값 받아오기기
  const handleCanvasSubmit = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "drawing.png");
  
    try {
      // 서버로 이미지 업로드 및 예측 요청
      const response = await axios.post("http://localhost:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // 예측 결과 상태 업데이트
      setPredictions(response.data.predictions); // 예측 데이터를 상태로 업데이트
      //console.log("게임세션: ",response.data.predictions)
      return response.data.predictions;
    } catch (error) {
      console.error("예측 요청 실패:", error);
      throw error;  // 에러 발생 시 예외 처리
    }
  };

  const currentDrawerIndex = calculateCurrentDrawerPlayerIndex();
  const currentDrawer = players[currentDrawerIndex];

  const playerSectionWidth = 20;
  const canvasSectionWidth = 60;
  const aiSectionWidth = 20;
  const componentContainerHeight = 75;
  const gameInfoHeaderHeight = 15;
  const sectionGap = 4;

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-cover bg-[url('/backgrounds/wooden-bg.jpg')] px-[150px] py-4 box-border flex-col">
      {/* 게임 정보 헤더 */}
      <div className="w-full max-w-7xl h-[100px] mb-4">
        <div className="flex justify-center items-center p-2.5 rounded-t-lg h-full">
          <div className="flex items-center w-full">
            <div className="flex-1 text-left pl-10"> {/* 왼쪽 섹션 */}
              <div className="text-6xl font-bold text-gray-800 whitespace-nowrap">ROUND {currentRound}</div>
            </div>
            
            <div className="flex-1 flex justify-center items-center"> {/* 중앙 섹션 */}
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
            
            <div className="flex-1 text-right pr-10"> {/* 오른쪽 섹션 */}
              <div className="text-lg text-gray-700 text-5xl">남은시간: {timeLeft}초</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-7xl">
      {/* 플레이어 컴포넌트 - 좌측 */}
      <div className="w-1/5 mr-8">
        <PlayerSection 
          currentRound={currentRound}
          activeDrawerIndex={activeDrawerIndex}
          guesserIndex={guesserIndex}
          roomId="example-room-id"
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
          quizWord={quizWord} // quizWord 추가
          predictions={predictions}

        />
      </div>
    </div>
  </div>
);
};

export default Game;