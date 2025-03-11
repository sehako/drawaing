// src/pages/Game.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/Game.css';

// 플레이어 타입 정의
interface Player {
  id: number;
  name: string;
  level: number;
  avatar: string;
}

// 게임 페이지 컴포넌트
const Game: React.FC = () => {
  // 플레이어 상태
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '김병이', level: 1, avatar: '/avatars/chick.png' },
    { id: 2, name: '문상혁', level: 50, avatar: '/avatars/muscular.png' },
    { id: 3, name: '차병균', level: 25, avatar: '/avatars/angry-bird.png' },
    { id: 4, name: '김재호', level: 16, avatar: '/avatars/yellow-bird.png' },
  ]);

  // 게임 상태
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [quizWord, setQuizWord] = useState<string>('바나나');
  const [timeLeft, setTimeLeft] = useState<number>(26);
  const [activeDrawerIndex, setActiveDrawerIndex] = useState<number>(0);
  const [guesserIndex, setGuesserIndex] = useState<number>(3); // 맞추는 사람 (예: 김재호)
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [guess, setGuess] = useState<string>('');

  // 캔버스 관련 상태와 ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('red');
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // AI 관련 상태
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [aiImages] = useState<string[]>([
    '/ai/fox.png',
    '/ai/eggs.png'
  ]);

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

  // 타이머 설정
  useEffect(() => {
    if (timeLeft <= 0) {
      handleNextPlayer();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeDrawerIndex !== (guesserIndex + 1) % 4) return; // 그리는 차례가 아니면 무시

    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLastPoint({ x, y });
    setIsDrawing(true);

    // 시작점 그리기
    context.beginPath();
    context.arc(x, y, isEraser ? 10 : 2, 0, Math.PI * 2);
    context.fillStyle = isEraser ? 'white' : currentColor;
    context.fill();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !lastPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 선 그리기
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(x, y);
    context.strokeStyle = isEraser ? 'white' : currentColor;
    context.lineWidth = isEraser ? 20 : 5;
    context.lineCap = 'round';
    context.stroke();

    setLastPoint({ x, y });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      handleNextPlayer(); // 마우스를 뗐을 때 자동으로 다음 플레이어로 넘어감
    }
  };

  // 색상 변경 핸들러
  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setIsEraser(false);
  };

  // 지우개 모드 토글
  const handleEraserToggle = () => {
    setIsEraser(true);
  };

  // 다음 플레이어로 넘기기
  const handleNextPlayer = () => {
    setIsDrawing(false);
    setTimeLeft(20); // 타이머 리셋

    // 다음 그리는 사람으로 변경
    setActiveDrawerIndex((activeDrawerIndex + 1) % 3);
    
    // 모든 플레이어가 그리기를 마치면 라운드 종료
    if (activeDrawerIndex === 2) {
      // 다음 라운드 준비 로직
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setGuesserIndex((guesserIndex + 1) % 4); // 다음 맞추는 사람
        setActiveDrawerIndex(0); // 첫 번째 그리는 사람으로 리셋
        
        // 캔버스 초기화
        if (context && canvasRef.current) {
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // 새 단어 설정 (실제로는 서버에서 받아올 것)
        const newWords = ['사과', '자동차', '컴퓨터', '강아지'];
        setQuizWord(newWords[Math.floor(Math.random() * newWords.length)]);
      }, 3000);
    }
  };

  // 추측 제출 핸들러
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 추측 로직 (실제로는 정답 확인 등을 서버와 연동)
    if (guess.trim().toLowerCase() === quizWord.toLowerCase()) {
      alert('정답입니다!');
      setCurrentRound(prev => prev + 1);
    } else {
      setAiAnswer('비슷하지만 틀렸습니다!');
    }
    
    setGuess('');
  };

  // 현재 그리는 사람의 인덱스 계산 (맞추는 사람 제외)
  const calculateCurrentDrawerPlayerIndex = () => {
    // 맞추는 사람의 인덱스가 guesserIndex이므로, 
    // 나머지 3명의 플레이어 중 activeDrawerIndex에 해당하는 플레이어를 찾음
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

  // 현재 그리는 플레이어
  const currentDrawerIndex = calculateCurrentDrawerPlayerIndex();
  const currentDrawer = players[currentDrawerIndex];

  return (
    <div className="game-container">
      {/* 왼쪽 플레이어 목록 */}
      <div className="players-container">
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`player-card ${index === guesserIndex ? 'guesser' : ''} ${index === currentDrawerIndex ? 'active-drawer' : ''}`}
          >
            <div className="player-avatar">
              <span className="player-level">LV{player.level}</span>
              <img src={player.avatar} alt={player.name} />
            </div>
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-actions">
                <button className="like-btn">👍</button>
                <button className="dislike-btn">👎</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 중앙 게임 영역 */}
      <div className="game-area">
        {/* 게임 헤더 */}
        <div className="game-header">
          <div className="round-info">{currentRound} ROUND</div>
          <div className="quiz-word">
            <div className="quiz-label">제시어</div>
            <div className="quiz-value">{players[guesserIndex] === currentDrawer ? '???' : quizWord}</div>
          </div>
          <div className="time-left">남은 시간 : {timeLeft}초</div>
        </div>

        {/* 캔버스 영역 */}
        <div className="canvas-container">
          <canvas 
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* 그리기 도구 */}
        <div className="drawing-tools">
          <button 
            className={`tool-btn ${!isEraser && currentColor === 'black' ? 'active' : ''}`}
            onClick={() => handleColorChange('black')}
          >
            <i className="tool-icon pencil">✏️</i>
          </button>
          <button 
            className={`tool-btn ${!isEraser && currentColor === 'red' ? 'active' : ''}`}
            onClick={() => handleColorChange('red')}
          >
            <div className="color-circle red"></div>
          </button>
          <button 
            className={`tool-btn ${!isEraser && currentColor === 'black' ? 'active' : ''}`}
            onClick={() => handleColorChange('black')}
          >
            <div className="color-circle black"></div>
          </button>
          <button 
            className={`tool-btn ${isEraser ? 'active' : ''}`}
            onClick={handleEraserToggle}
          >
            <i className="tool-icon eraser">🧽</i>
          </button>
          <button 
            className="tool-btn"
            onClick={() => {}} // 이모티콘 기능 구현 예정
          >
            <i className="tool-icon emoji">😊</i>
          </button>
          <button 
            className="next-btn"
            onClick={handleNextPlayer}
          >
            넘기기
          </button>
        </div>

        {/* 추측 입력 */}
        <form className="guess-form" onSubmit={handleGuessSubmit}>
          <input 
            type="text" 
            value={guess} 
            onChange={(e) => setGuess(e.target.value)}
            placeholder="정답 입력..."
            disabled={guesserIndex !== 3} // 예시로 김재호(4번째 플레이어)만 추측 가능
          />
          <button type="submit" className="submit-btn">←</button>
          <button type="button" className="pass-btn">PASS</button>
        </form>
      </div>

      {/* 오른쪽 AI 영역 */}
      <div className="ai-container">
        <div className="ai-card">
          <img src={aiImages[0]} alt="AI 추측" className="ai-image" />
          <div className="ai-guess">{aiAnswer}</div>
        </div>
        <div className="ai-answer">
          <img src={aiImages[1]} alt="AI 답변" className="ai-answer-image" />
        </div>
      </div>
    </div>
  );
};

export default Game;