import React, { useState, useRef, useEffect } from 'react';
import ColorPicker from './ColorPicker';
import chick from '../../assets/Common/chick.gif'
import CustomModal from '../common/CustomModal';
import { CanvasCorrectModal } from './GameModals';

interface CanvasSectionProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  context: CanvasRenderingContext2D | null;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  lastPoint: { x: number; y: number } | null;
  setLastPoint: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  currentColor: string;
  isEraser: boolean;
  showCorrectAnswer: boolean;
  quizWord: string;
  currentRound: number;
  timeLeft: number;
  hasCompleted: boolean;
  setHasCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  handleColorChange: (color: string) => void;
  handleEraserToggle: () => void;
  handleNextPlayer: () => void;
  currentDrawer: { name: string };
  calculateCurrentDrawerPlayerIndex: () => number;
  guess: string;
  setGuess: React.Dispatch<React.SetStateAction<string>>;
  handleGuessSubmit: (e: React.FormEvent) => void;
  handlePass: () => void;
  activeDrawerIndex: number;
}

// 그림 데이터 저장을 위한 인터페이스
interface DrawingData {
  drawerIndex: number;
  imageData: ImageData | null;
}

const CanvasSection: React.FC<CanvasSectionProps> = ({
  canvasRef,
  context,
  isDrawing,
  setIsDrawing,
  lastPoint,
  setLastPoint,
  currentColor,
  isEraser,
  showCorrectAnswer,
  quizWord,
  currentRound,
  timeLeft,
  hasCompleted,
  setHasCompleted,
  handleColorChange,
  handleEraserToggle,
  handleNextPlayer,
  currentDrawer,
  calculateCurrentDrawerPlayerIndex,
  guess,
  setGuess,
  handleGuessSubmit,
  handlePass,
  activeDrawerIndex
}) => {
  
  const totalTime = 20; // 각 플레이어에게 20초 부여
  const timerBarWidth = (timeLeft / totalTime) * 100; // 바의 길이는 그대로 유지
  
  // 컬러 피커 상태 관리
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);

  // 마우스 커서 관련 상태
  const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number } | null>(null);
  
  // 마우스 커서용 캔버스 참조
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 각 플레이어의 그림 데이터 저장
  const [drawingHistory, setDrawingHistory] = useState<DrawingData[]>([]);
  
  // 현재 플레이어의 그림 저장용 캔버스
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 현재 라운드에서 각 플레이어가 그림을 그렸는지 추적
  const [hasDrawnInRound, setHasDrawnInRound] = useState<boolean[]>([false, false, false]);
  
  // 현재 플레이어가 이미 그림을 그렸는지 확인
  const hasCurrentPlayerDrawn = hasDrawnInRound[activeDrawerIndex];
  
  // 현재 플레이어 그림 저장 함수
  const saveCurrentDrawing = () => {
    if (!canvasRef.current || !context) return;
    
    // 현재 캔버스의 이미지 데이터 가져오기
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // 이미 해당 플레이어의 그림이 있는지 확인
    const existingIndex = drawingHistory.findIndex(item => item.drawerIndex === activeDrawerIndex);
    
    if (existingIndex >= 0) {
      // 기존 그림 업데이트
      const updatedHistory = [...drawingHistory];
      updatedHistory[existingIndex] = { drawerIndex: activeDrawerIndex, imageData };
      setDrawingHistory(updatedHistory);
    } else {
      // 새 그림 추가
      setDrawingHistory([...drawingHistory, { drawerIndex: activeDrawerIndex, imageData }]);
    }
    
    // 현재 플레이어가 그림을 그렸음을 표시
    const newHasDrawnInRound = [...hasDrawnInRound];
    newHasDrawnInRound[activeDrawerIndex] = true;
    setHasDrawnInRound(newHasDrawnInRound);
  };
  
  // 캔버스에 모든 그림 그리기
  const renderAllDrawings = () => {
    if (!canvasRef.current || !context) return;
    
    // 캔버스 초기화
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // 모든 그림 데이터 캔버스에 그리기
    drawingHistory.forEach(drawing => {
      if (drawing.imageData) {
        context.putImageData(drawing.imageData, 0, 0);
      }
    });
  };
  
  // 현재 플레이어의 그림만 삭제 (그리기 상태는 변경 없음)
  const clearCurrentDrawing = () => {
    if (!canvasRef.current || !context) return;
    
    // 현재 플레이어의 그림을 히스토리에서 제거
    const updatedHistory = drawingHistory.filter(drawing => drawing.drawerIndex !== activeDrawerIndex);
    setDrawingHistory(updatedHistory);
    
    // 캔버스를 다시 그림
    renderAllDrawings();
  };

  // 커서 위치 업데이트 및 그리기 함수
  const updateCursorPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 이미 그림을 그렸다면 커서 업데이트 안 함
    if (hasCurrentPlayerDrawn && hasCompleted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 계산 (커서 끝점 조정: -1, -1 픽셀 오프셋)
    const x = (e.clientX - rect.left - 1) * scaleX;
    const y = (e.clientY - rect.top - 1) * scaleY;
    
    setCursorPosition({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 이미 그림을 그렸거나 완료 상태라면 그리기 불가능
    if (hasCurrentPlayerDrawn || hasCompleted) return;
  
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
  
    // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 계산 (커서 끝점 조정: -1, -1 픽셀 오프셋)
    const x = (e.clientX - rect.left - 1) * scaleX;
    const y = (e.clientY - rect.top - 1) * scaleY;
  
    setLastPoint({ x, y });
    setIsDrawing(true);
  
    context.beginPath();
    context.arc(x, y, isEraser ? 10 : 2, 0, Math.PI * 2);
    context.fillStyle = isEraser ? 'white' : currentColor;
    context.fill();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 항상 커서 위치 업데이트
    updateCursorPosition(e);
    
    // 이미 그림을 그렸거나 완료 상태라면 그리기 불가능
    if (hasCurrentPlayerDrawn || !isDrawing || !context || !lastPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 계산 (커서 끝점 조정: -1, -1 픽셀 오프셋)
    const x = (e.clientX - rect.left - 1) * scaleX;
    const y = (e.clientY - rect.top - 1) * scaleY;

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
      setHasCompleted(true);
      
      // 그림이 완료되면 현재 그림 저장
      saveCurrentDrawing();
      
      // 현재 플레이어가 그림을 그렸음을 표시 (추가된 부분)
      const newHasDrawnInRound = [...hasDrawnInRound];
      newHasDrawnInRound[activeDrawerIndex] = true;
      setHasDrawnInRound(newHasDrawnInRound);
    }
  };

  const handleMouseLeave = () => {
    setCursorPosition(null);
    if (isDrawing) {
      setLastPoint(null);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateCursorPosition(e);
    
    if (isDrawing && !hasCurrentPlayerDrawn) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // 정확한 좌표 계산 (커서 끝점 조정: -1, -1 픽셀 오프셋)
      const x = (e.clientX - rect.left - 1) * scaleX;
      const y = (e.clientY - rect.top - 1) * scaleY;
      
      setLastPoint({ x, y });
    }
  };
  
  // Next 버튼 클릭 시 현재 그림 저장 후 다음 플레이어로 전환
  const handleNextPlayerWithSave = () => {
    // 현재 그림 저장
    saveCurrentDrawing();
    
    // 원래 Next 함수 호출
    handleNextPlayer();
  };

  // 컬러 피커에서 선택한 색상 적용
  const handleColorSelect = (color: string) => {
    handleColorChange(color);
  };

  // 순서3(activeDrawerIndex가 2)일 때 Next 버튼 비활성화 여부 확인
  const isNextButtonDisabled = !hasCompleted || activeDrawerIndex === 2;

  useEffect(() => {
    // 라운드나 첫 번째 플레이어로 돌아왔을 때 모든 상태 초기화
    if (currentRound > 0 && activeDrawerIndex === 0) {
      setDrawingHistory([]);
      setHasDrawnInRound([false, false, false]);
      setHasCompleted(false);  // 그리기 완료 상태 초기화
      
      if (canvasRef.current && context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [currentRound, activeDrawerIndex]);

  useEffect(() => {
    if (showCorrectAnswer) {
      setIsCorrectModalOpen(true);
    }
  }, [showCorrectAnswer]);

  // 컴포넌트 마운트/업데이트 시 커서 캔버스 설정
  useEffect(() => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return;
    
    const cursorCtx = cursorCanvas.getContext('2d');
    if (!cursorCtx) return;
    
    // 커서 그리기 함수
    const drawCursor = () => {
      if (!cursorPosition) return;
      
      // 이미 그림을 그렸다면 커서 표시 안 함
      if (hasCurrentPlayerDrawn && hasCompleted) return;
      
      // 캔버스 지우기
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      
      // 커서 그리기 (십자형 커서)
      cursorCtx.beginPath();
      cursorCtx.strokeStyle = isEraser ? 'rgba(0,0,0,0.7)' : currentColor;
      cursorCtx.lineWidth = 1;
      
      // 가로선
      cursorCtx.moveTo(cursorPosition.x - 5, cursorPosition.y);
      cursorCtx.lineTo(cursorPosition.x + 5, cursorPosition.y);
      
      // 세로선
      cursorCtx.moveTo(cursorPosition.x, cursorPosition.y - 5);
      cursorCtx.lineTo(cursorPosition.x, cursorPosition.y + 5);
      
      cursorCtx.stroke();
      
      // 원형 커서 (펜일 때는 작게, 지우개일 때는 크게)
      cursorCtx.beginPath();
      cursorCtx.strokeStyle = isEraser ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)';
      cursorCtx.lineWidth = 1;
      cursorCtx.arc(cursorPosition.x, cursorPosition.y, isEraser ? 10 : 2, 0, Math.PI * 2);
      cursorCtx.stroke();
    };
    
    // 커서 위치가 변경될 때마다 커서 다시 그리기
    if (cursorPosition) {
      drawCursor();
    }
    
    return () => {
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    };
  }, [cursorPosition, isEraser, currentColor, hasCurrentPlayerDrawn, hasCompleted]);
  
  // 플레이어가 바뀌거나 라운드가 바뀔 때 히스토리 초기화
  useEffect(() => {
    // 라운드나 첫 번째 플레이어로 돌아왔을 때 모든 상태 초기화
    if (currentRound > 0 && activeDrawerIndex === 0) {
      setDrawingHistory([]);
      setHasDrawnInRound([false, false, false]);
      setHasCompleted(false);  // 그리기 완료 상태 초기화
      
      if (canvasRef.current && context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [currentRound, activeDrawerIndex]);
  
  // 컴포넌트 마운트 시 한 번 모든 그림 렌더링
  useEffect(() => {
    renderAllDrawings();
  }, []);

  return (
    <div className="h-[580px] flex flex-col bg-gray-300">
      {/* 타이머 바 */}
      <div className="w-full h-7 bg-gray-200">
      <div 
        className={`h-full ${
          timeLeft <= 5 
            ? 'bg-red-500 animate-[pulse_0.5s_ease-in-out_infinite]' 
            : timeLeft <= 10 
              ? 'bg-yellow-300' 
              : 'bg-green-500'
        }`}
        style={{ 
          width: `${timerBarWidth}%`,
          transition: 'width 1s linear',
        }}
      />
      </div>

      {/* 캔버스 컨테이너 */}
      <div className="relative bg-white border border-gray-300 flex-grow flex flex-col justify-between rounded-lg overflow-hidden">
        {/* 캔버스 영역 */}
        <div className="flex-grow flex justify-center items-center relative">
          <canvas
            ref={canvasRef as React.RefObject<HTMLCanvasElement>}
            width={700}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className="w-full h-full shadow-md"
            style={{ 
              touchAction: 'none', 
              cursor: hasCurrentPlayerDrawn ? 'not-allowed' : 'none',
              pointerEvents: hasCurrentPlayerDrawn ? 'none' : 'auto' 
            }}
          />
          
          {/* 커스텀 커서 캔버스 */}
          <canvas 
            ref={cursorCanvasRef}
            width={700}
            height={400}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {/* 숨겨진 임시 캔버스 (그림 데이터 처리용) */}
          <canvas 
            ref={tempCanvasRef}
            width={700} 
            height={400} 
            className="hidden"
          />
          
          {/* 정답 표시 오버레이 */}
          {showCorrectAnswer && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center animate-fade-in">
              <div className="bg-green-500 text-white p-5 rounded-lg text-2xl font-bold text-center animate-bounce">
                Correct Answer!
                <div className="mt-2.5 text-xl text-yellow-300">{quizWord}</div>
              </div>
            </div>
          )}
          
          {/* 이미 그림을 그렸음을 알리는 오버레이 */}
          {hasCurrentPlayerDrawn && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-700 text-white px-4 py-1 rounded-full text-sm font-medium">
              이미 그림을 그렸습니다 (1회만 가능)
            </div>
          )}
        </div>
        
        {/* 도구 모음 - 캔버스 컨테이너 내부 하단에 배치 */}
        <div className="flex bg-gray-200 p-2 justify-between items-center border-t border-gray-300">
          <div className="flex gap-2">
            {/* 컬러 피커 버튼 - 현재 선택된 색상으로 채워짐 */}
            <div className="relative">
              {/* 컬러 피커 팝업 - 버튼 위에 표시 */}
              {isColorPickerOpen && (
                <div className="absolute z-50 bottom-full left-0 mb-2">
                  <ColorPicker 
                    isOpen={true}
                    onClose={() => setIsColorPickerOpen(false)} 
                    onColorSelect={handleColorSelect}
                    initialColor={currentColor}
                  />
                </div>
              )}
              
              <button 
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} 
                className="w-8 h-8 rounded-full border border-gray-400 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: isEraser ? 'white' : currentColor }}
                aria-label="색상 선택"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={getContrastColor(currentColor)} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
            </div>

            {/* 자주 사용하는 컬러 바로가기 */}
            <button 
              onClick={() => handleColorChange('#FF5252')} 
              className="w-8 h-8 bg-red-500 rounded-full border border-gray-300 hover:opacity-90"
            />
            <button 
              onClick={() => handleColorChange('#000000')} 
              className="w-8 h-8 bg-black rounded-full border border-gray-300 hover:opacity-90"
            />
            <button 
              onClick={() => handleColorChange('#2196F3')} 
              className="w-8 h-8 bg-blue-500 rounded-full border border-gray-300 hover:opacity-90"
            />
            
            {/* 내 그림만 지우기 버튼 - 그림을 그렸을 때만 활성화 */}
            <button 
              onClick={clearCurrentDrawing} 
              className={`px-2 py-1 bg-red-100 border border-red-300 rounded text-xs font-medium text-red-700 hover:bg-red-200 transition-colors ${
                !hasCurrentPlayerDrawn ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!hasCurrentPlayerDrawn}
            >
              내 그림만 지우기
            </button>
          </div>

          
          {/* 다음 플레이어 버튼 */}
          <button
            onClick={handleNextPlayerWithSave}
            disabled={isNextButtonDisabled}
            className={`bg-blue-500 text-white rounded px-3 py-1 text-sm ${isNextButtonDisabled && 'opacity-50 cursor-not-allowed'}`}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* 정답 입력 폼 - 텍스트 입력만 남김 */}
      <div className="flex bg-gray-100 p-2.5 rounded-b-lg justify-between h-[10%]">
        <form onSubmit={handleGuessSubmit} className="flex w-full gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="정답 입력..."
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      <CustomModal
      isOpen={isCorrectModalOpen}
      onClose={() => {
        setIsCorrectModalOpen(false);
      }}
      title="정답입니다!"
      media={{
        type: 'gif',
        src: chick,
        alt: '축하 GIF'
      }}
      actionButtons={{
        confirmText: "계속하기",
        onConfirm: () => {
          setIsCorrectModalOpen(false);
          handleNextPlayer();
        }
      }}
    >
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          정답은 "{quizWord}"입니다!
        </p>
        <p className="text-green-600 font-bold">
          축하합니다! 정답을 맞추셨습니다.
        </p>
      </div>
    </CustomModal>
    </div>
  );
};

// 텍스트 대비 색상 계산 함수 (어두운 배경에는 흰색, 밝은 배경에는 검은색)
function getContrastColor(hexOrRgb: string): string {
  let r, g, b;
  
  if (hexOrRgb.startsWith('#')) {
    const hex = hexOrRgb.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hexOrRgb.startsWith('rgb')) {
    const match = hexOrRgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else {
      return 'black'; // 기본값
    }
  } else {
    return 'black'; // 기본값
  }
  
  // YIQ 공식으로 밝기 계산 (대략적인 휘도)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

export default CanvasSection;