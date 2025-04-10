// 
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ColorPicker from './ColorPicker';
import chick from '../../assets/Common/chick.gif'
import CustomModal from '../common/CustomModal';
import axios from 'axios';
import pen_sound from '../../assets/Sound/drawing_sound.mp3';
import { Howl } from 'howler';
import drawingService, { DrawPoint } from '../../api/drawingService';

interface CanvasSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  context: CanvasRenderingContext2D | null;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  // 수정할 부분
  lastPoint: DrawPoint | null;
  setLastPoint: React.Dispatch<React.SetStateAction<DrawPoint | null>>;
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
  currentDrawer: { id: number; name: string; level: number; avatar: string };
  calculateCurrentDrawerPlayerIndex: () => number;
  guess: string;
  setGuess: React.Dispatch<React.SetStateAction<string>>;
  handleGuessSubmit: (e: React.FormEvent) => Promise<void>;
  handlePass: () => void;
  activeDrawerIndex: number;
  handleCanvasSubmit: (blob: Blob) => Promise<any>;
  setPredictions: React.Dispatch<React.SetStateAction<{ result: string; correct: boolean }>>;
  roomId: string;
  sessionId: string;
  canDraw?: boolean;
  gameTimeLeft: number; // 새로 추가
}

// 그림 데이터 저장을 위한 인터페이스
interface DrawingData {
  [userId: number]: DrawPoint[]; // userId를 key로, 좌표 배열을 value로 갖는 객체
}

interface StoredDrawingData {
  drawerIndex: number;
  userId: number;
  imageData: ImageData | null;
  points: DrawPoint[];
}

const CanvasSection: React.FC<CanvasSectionProps> = ({
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
  activeDrawerIndex,
  handleCanvasSubmit, 
  setPredictions,
  roomId,
  sessionId,
  canvasRef,
  context,
  canDraw = false,
  gameTimeLeft=0,
}) => {
  const penSoundRef = useRef<Howl | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const [isMouseButtonDown, setIsMouseButtonDown] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Array<{x: number, y: number, timestamp?: number, isNewStroke?: boolean}>>([]);


  const [lastSoundTime, setLastSoundTime] = useState(0);

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
  const [drawingHistory, setDrawingHistory] = useState<StoredDrawingData[]>([]);
  
  // 현재 플레이어의 그림 저장용 캔버스
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 현재 라운드에서 각 플레이어가 그림을 그렸는지 추적
  const [hasDrawnInRound, setHasDrawnInRound] = useState<boolean[]>([false, false, false]);
  
  // 서버에서 받은 그리기 포인트를 저장할 상태
  const [receivedDrawingPoints, setReceivedDrawingPoints] = useState<Array<{x: number, y: number}>>([]);
  
  // 현재 플레이어가 이미 그림을 그렸는지 확인
  const hasCurrentPlayerDrawn = hasDrawnInRound[activeDrawerIndex];
  const lastSendTimeRef = useRef<number>(Date.now());

  const userIds = [1, 2, 3, 4]; // 하드코딩된 사용자 ID 배열 (4명의 사용자)
  
  const currentUserId = userIds[activeDrawerIndex];
  const [allDrawingData, setAllDrawingData] = useState<DrawingData>({});
  const [receivedDrawingData, setReceivedDrawingData] = useState<DrawingData>({});
  
  const handleReceivedDrawingPoints = useCallback((points: Array<{x: number, y: number}>) => {
    // console.log('서버에서 받은 그리기 포인트:', points);
    setReceivedDrawingPoints(prevPoints => [...prevPoints, ...points]);
  }, []);
  
  const previousUserIdsRef = useRef<Set<number>>(new Set());
    // 웹소켓 구독 및 초기화 useEffect
    useEffect(() => {
      // roomId와 sessionId 유효성 검사
      if (!roomId || !sessionId) {
        // console.warn('roomId 또는 sessionId가 유효하지 않습니다.');
        return;
      }
      
      // 웹소켓 설정 및 구독 함수
      const setupWebSocket = async () => {
        try {
          // STOMP 클라이언트 초기화
          await drawingService.initializeClient(roomId, sessionId);
          
          // 그리기 포인트 구독
          const unsubscribe = drawingService.subscribeToDrawingPoints(
            roomId, 
            sessionId, 
            (drawingData: DrawingData) => {
              // console.log('서버에서 받은 그림 데이터:', drawingData);
              
              // 현재 메시지에 포함된 사용자 ID 목록
              const currentUserIds = new Set(Object.keys(drawingData).map(id => parseInt(id)));
              
              // 이전에 있었지만 현재 메시지에 없는 사용자 ID 목록 확인
              const deletedUserIds = Array.from(previousUserIdsRef.current)
                .filter(id => !currentUserIds.has(id));
              
              // 지우기 작업이 있는지 확인 (빈 배열이 있는지)
              let hasEraseOperation = false;
              let erasedUserId: number | null = null;
              
              Object.entries(drawingData).forEach(([userIdStr, points]) => {
                if (points.length === 0) {
                  hasEraseOperation = true;
                  erasedUserId = parseInt(userIdStr);
                  // console.log(`사용자 ${userIdStr}의 그림 지우기 이벤트 감지됨 (빈 배열)`);
                }
              });
              
              // 지우기 이벤트 처리 - 빈 배열이 있는 경우
              if (hasEraseOperation && erasedUserId !== null) {
                // console.log(`사용자 ${erasedUserId}의 그림 지우기 이벤트 처리 중...`);
                
                // 해당 사용자의 그림을 히스토리에서 제거
                setDrawingHistory(prevHistory => {
                  // 지울 그림과 유지할 그림 분리
                  const erasedUserDrawings = prevHistory.filter(d => d.userId === erasedUserId);
                  const otherDrawings = prevHistory.filter(d => d.userId !== erasedUserId);
                  
                  // console.log(`지울 그림 수: ${erasedUserDrawings.length}, 유지할 그림 수: ${otherDrawings.length}`);
                  
                  // 캔버스 초기화하고 유지할 그림만 다시 그리기
                  if (canvasRef.current && context) {
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    
                    otherDrawings.forEach(drawing => {
                      if (drawing.imageData) {
                        context.putImageData(drawing.imageData, 0, 0);
                      }
                    });
                  }
                  
                  return otherDrawings;
                });
                
                // 그림을 그리지 않은 상태로 설정 (해당 사용자가 현재 활성 사용자인 경우)
                if (erasedUserId === currentUserId) {
                  setHasCompleted(false);
                  setHasDrawnInRound(prev => {
                    const updated = [...prev];
                    updated[activeDrawerIndex] = false;
                    return updated;
                  });
                }
              }
              // 일반 그리기 데이터 처리
              else {
                Object.entries(drawingData).forEach(([userIdStr, points]) => {
                  if (points.length > 0) {
                    const userId = parseInt(userIdStr);
                    
                    setReceivedDrawingData(prev => {
                      const newData = { ...prev };
                      if (!newData[userId]) {
                        newData[userId] = [];
                      }
                      newData[userId] = [...newData[userId], ...points];
                      return newData;
                    });
                  }
                });
              }
              
              // 사용자 ID 목록 업데이트 (현재 그리기 데이터 기준)
              // 주: 지우기 이벤트를 처리한 후에 목록 업데이트
              previousUserIdsRef.current = currentUserIds;
            }
          );
          
          return unsubscribe;
        } catch (error) {
          // console.error('웹소켓 설정 중 오류:', error);
        }
      };
      
      // 웹소켓 설정 실행
      const unsubscribePromise = setupWebSocket();
      
      // 컴포넌트 언마운트 시 정리
      return () => {
        // 구독 해제
        unsubscribePromise.then(unsubscribe => unsubscribe?.());
        
        // 연결 종료
        drawingService.disconnect();
      };
    }, [roomId, sessionId, context, canvasRef, currentUserId, activeDrawerIndex]);
  
    // 받은 그리기 포인트 렌더링 useEffect
    useEffect(() => {
      if (!context || !canvasRef.current || Object.keys(receivedDrawingData).length === 0) return;
    
      if (!isDrawing) {
        Object.entries(receivedDrawingData).forEach(([userIdStr, points]) => {
          const userId = parseInt(userIdStr);
          
          // 빈 배열인 경우 지우기 이벤트로 처리
          if (points.length === 0) {
            // console.log(`그림 렌더링 중 지우기 이벤트 감지: 사용자 ${userId}`);
            return; // 건너뛰기
          }
          
          // 모든 사용자의 그림을 검은색으로 표시
          points.forEach((point: DrawPoint, index: number) => {
            // 개별 점 그리기
            context.beginPath();
            context.arc(point.x, point.y, 2, 0, Math.PI * 2);
            context.fillStyle = 'black'; // 모든 유저 검은색으로 통일
            context.fill();
    
            // 연속된 점들을 선으로 연결
            if (index > 0) {
              const prevPoint = points[index - 1];
              context.beginPath();
              context.moveTo(prevPoint.x, prevPoint.y);
              context.lineTo(point.x, point.y);
              context.strokeStyle = 'black'; // 모든 선 검은색
              context.lineWidth = 5;
              context.lineCap = 'round';
              context.stroke();
            }
          });
        });
    
        // 그린 후 포인트 초기화
        setReceivedDrawingData({});
      }
    }, [receivedDrawingData, context, isDrawing, canvasRef]);
  
    // 그리기 포인트 전송 함수
    const sendDrawingPoints = useCallback((points: DrawPoint[]) => {
      // roomId, sessionId, 포인트 유효성 검사
      if (!roomId || !sessionId || points.length === 0) {
        // console.log('전송 취소: 좌표 없음 또는 roomId/sessionId 없음');
        return false;
      }
      
      // 그리기 포인트 전송 로그
      // console.log(`전송 시도: ${points.length}개 좌표, roomId=${roomId}, sessionId=${sessionId}`);
      
      // drawingService를 통한 포인트 전송
      return drawingService.sendDrawingPoints(roomId, sessionId, currentUserId, points);
    }, [roomId, sessionId]);
    
  // STOMP 클라이언트 초기화
  useEffect(() => {
    if (!roomId || !sessionId) return;
    
    const initializeClient = async () => {
      try {
        await drawingService.initializeClient(roomId, sessionId);
        // console.log('그림 전송 서비스 초기화 완료');
        
      } catch (error) {
        // console.error('그림 전송 서비스 초기화 실패:', error);
      }
    };
    
    initializeClient();
    
    return () => {
      drawingService.disconnect();
    };
  }, [roomId, sessionId]);

// sendDrawingData 함수 내에 로그 추가
const sendDrawingData = useCallback(() => {
  if (!roomId || !sessionId || drawingPoints.length < 2) {
    return;
  }
  
  // 그림 포인트 전송
  const success = drawingService.sendDrawingPoints(
    roomId, 
    sessionId, 
    currentUserId, 
    drawingPoints
  );
  
  if (success) {
    // 마지막 점만 유지하면서 isNewStroke는 false로 설정
    // 이렇게 하면 다음 배치에서 이전 선과 연결됨
    const lastPoint = drawingPoints[drawingPoints.length - 1];
    setDrawingPoints([{...lastPoint, isNewStroke: false}]);
  }
}, [drawingPoints, roomId, sessionId, currentUserId]);


  const saveCurrentDrawing = async () => {
    if (!canvasRef.current || !context) return;
  
    // 🎨 현재 캔버스의 이미지 데이터 저장 (FastAPI 요청 이후 실행)
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

    // 기존 플레이어의 그림이 있는지 확인
    const existingIndex = drawingHistory.findIndex(item => item.drawerIndex === activeDrawerIndex);

    if (existingIndex >= 0) {
      // 기존 그림 업데이트
      const updatedHistory = [...drawingHistory];
      updatedHistory[existingIndex] = {
        drawerIndex: activeDrawerIndex,
        userId: currentUserId,
        imageData,
        points: drawingPoints
      };
      setDrawingHistory(updatedHistory); // 중복 추가를 방지하기 위해 기존 배열 업데이트
    } else {
      setDrawingHistory([
        ...drawingHistory, 
        { 
          drawerIndex: activeDrawerIndex, 
          userId: currentUserId,
          imageData, 
          points: drawingPoints 
        }
      ]);
    }

    // 현재 플레이어가 그림을 그렸음을 표시
    const newHasDrawnInRound = [...hasDrawnInRound];
    newHasDrawnInRound[activeDrawerIndex] = true;
    setHasDrawnInRound(newHasDrawnInRound);

    // 🎯 캔버스 데이터를 Blob으로 변환 후 FastAPI로 전송
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      
      try {
        const predictions = await handleCanvasSubmit(blob);
        setPredictions(predictions); // 예측값을 state로 저장
        console.log("캔버스세션: ",predictions)
      } catch (error) {
        // console.error("예측값 받아오기 실패:", error);
      }
    }, "image/png");
    
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
  
// 현재 플레이어의 그림만 삭제
const clearCurrentDrawing = () => {
  if (!canvasRef.current || !context) return;
  
  // console.log("=== 지우기 작업 시작 ===");
  // console.log("지우기 전 현재 데이터:", {
  //   drawingHistory: [...drawingHistory],
  //   drawingHistory에서_현재유저그림: drawingHistory.filter(d => d.userId === currentUserId),
  //   currentUserId
  // });
  
  // 현재 플레이어의 그림을 히스토리에서 제거 (userId로 구분)
  const updatedHistory = drawingHistory.filter(drawing => drawing.userId !== currentUserId);
  setDrawingHistory(updatedHistory);
  
  // 캔버스 초기화 - 흰색으로 채우기
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  
  // 남은 다른 플레이어들의 그림만 다시 그리기
  updatedHistory.forEach(drawing => {
    if (drawing.imageData) {
      context.putImageData(drawing.imageData, 0, 0);
    }
  });
  
  // 현재 플레이어가 그림을 그리지 않았음을 표시
  const newHasDrawnInRound = [...hasDrawnInRound];
  newHasDrawnInRound[activeDrawerIndex] = false;
  setHasDrawnInRound(newHasDrawnInRound);
  
  // 그림 완료 상태 초기화하여 다시 그릴 수 있게 함
  setHasCompleted(false);
  
  // 지우기 이벤트를 웹소켓으로 전송
  if (roomId && sessionId) {
    // 명확한 지우기 이벤트 로깅
    // console.log("=== 지우기 이벤트 웹소켓 전송 ===");
    // console.log("전송 대상 roomId:", roomId);
    // console.log("전송 대상 sessionId:", sessionId);
    // console.log("지울 userId:", currentUserId);
    
    // 빈 배열 전송 - 현재 사용자의 그림 지우기 신호
    const success = drawingService.sendDrawingPoints(roomId, sessionId, currentUserId, []);
    
    // console.log(`웹소켓 전송 결과: ${success ? '성공' : '실패'}`);
    // console.log("=== 지우기 작업 완료 ===");
    
    // 그림 지운 후 상태 초기화
    setDrawingPoints([]);
  }
};

const handleReceivedDrawingData = useCallback((data: DrawingData) => {
  // 새로운 그리기 데이터를 상태에 병합
  setReceivedDrawingData(prevData => {
    // 새 객체 생성 (참조 변경을 위해)
    const newData = { ...prevData };
    
    // 각 사용자 ID에 대해
    Object.entries(data).forEach(([userIdStr, points]) => {
      const numUserId = parseInt(userIdStr);
      
      // 빈 배열은 지우기 이벤트로 처리
      if (points.length === 0) {
        delete newData[numUserId];
        return;
      }
      
      // 해당 사용자의 데이터가 없으면 초기화
      if (!newData[numUserId]) {
        newData[numUserId] = [];
      }
      
      // 새 포인트를 기존 포인트에 추가 - 선이 연결되도록 확인
      if (newData[numUserId].length > 0 && points.length > 0) {
        const lastExistingPoint = newData[numUserId][newData[numUserId].length - 1];
        const firstNewPoint = points[0];
        
        // 두 점 사이의 거리 계산
        const distance = Math.sqrt(
          Math.pow(firstNewPoint.x - lastExistingPoint.x, 2) + 
          Math.pow(firstNewPoint.y - lastExistingPoint.y, 2)
        );
        
        // 거리가 멀면 선 연결을 위해 중간점 추가
        if (distance > 10) {
          newData[numUserId].push({
            x: (lastExistingPoint.x + firstNewPoint.x) / 2,
            y: (lastExistingPoint.y + firstNewPoint.y) / 2
          });
        }
      }
      
      // 새 포인트 추가
      newData[numUserId] = [...newData[numUserId], ...points];
    });
    
    return newData;
  });
}, []);

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
    if (!canDraw || hasCurrentPlayerDrawn || hasCompleted) return;
  
    const canvas = canvasRef.current;
    if (!canvas || !context) return;
  
    // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 계산
    const x = (e.clientX - rect.left - 1) * scaleX;
    const y = (e.clientY - rect.top - 1) * scaleY;
  
    // 새 선 시작을 표시하여 시작점 저장
    const newPoint = {
      x,
      y,
      timestamp: Date.now(),
      isNewStroke: true // 새로운 선 시작
    };
    
    setLastPoint(newPoint);
    setIsDrawing(true);
    
    // 새 점 저장
    setDrawingPoints([newPoint]);
  
    // 시작점 그리기
    context.beginPath();
    context.arc(x, y, isEraser ? 10 : 2, 0, Math.PI * 2);
    context.fillStyle = isEraser ? 'white' : currentColor;
    context.fill();
  };
  

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 항상 커서 위치 업데이트
    updateCursorPosition(e);
    
    // 이미 그림을 그렸거나 완료 상태라면 그리기 불가능
    if (!canDraw || hasCurrentPlayerDrawn || !isDrawing || !context || !lastPoint) return;
  
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 계산
    const x = (e.clientX - rect.left - 1) * scaleX;
    const y = (e.clientY - rect.top - 1) * scaleY;
  
    // 새 점에 타임스탬프 추가
    const newPoint = {
      x,
      y,
      timestamp: Date.now(),
      isNewStroke: false // 연속된 선
    };
    
    // 현재 좌표를 그림 포인트 배열에 추가
    setDrawingPoints(prev => [...prev, newPoint]);
    
    // 캔버스에 선 그리기
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(x, y);
    context.strokeStyle = isEraser ? 'white' : currentColor;
    context.lineWidth = isEraser ? 20 : 5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
    
    // 마지막 좌표 업데이트
    setLastPoint({ x, y });
    
    // 자주 데이터 전송
    const now = Date.now();
    if (now - lastSendTimeRef.current > 30) {
      sendDrawingData();
      lastSendTimeRef.current = now;
    }
  };


const handleMouseUp = () => {
  if (isDrawing) {
    setIsDrawing(false);
    setHasCompleted(true);
    
    // 그림이 완료되면 현재 그림 저장
    saveCurrentDrawing();
    
    // 현재 플레이어가 그림을 그렸음을 표시
    const newHasDrawnInRound = [...hasDrawnInRound];
    newHasDrawnInRound[activeDrawerIndex] = true;
    setHasDrawnInRound(newHasDrawnInRound);
    
    // 소리 중지 추가
    if (penSoundRef.current) {
      penSoundRef.current.stop();
    }
  }
};

const handleMouseLeave = () => {
  setCursorPosition(null);
  
  // 마우스가 캔버스를 떠날 때 이전 위치(lastPoint)를 null로 설정
  // 이렇게 하면 다시 들어왔을 때 연결선이 그려지지 않음
  if (isDrawing) {
    setLastPoint(null);
    
    // 소리 중지
    if (penSoundRef.current) {
      penSoundRef.current.stop();
    }
  }
};

const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
  updateCursorPosition(e);
  
  // 마우스 버튼이 여전히 눌려있고 그리기 상태일 때
  if (isDrawing && !hasCurrentPlayerDrawn) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스의 CSS 크기와 실제 캔버스 크기의 비율 계산
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 정확한 좌표 계산
    const x = (e.clientX - rect.left - 1) * scaleX;
    const y = (e.clientY - rect.top - 1) * scaleY;
    
    // 새로운 시작점만 설정하고 이전 위치와 연결하지 않음
    setLastPoint({ x, y });
    
    // 새로운 점 찍기 (선을 연결하지 않고)
    if (context) {
      context.beginPath();
      context.arc(x, y, isEraser ? 10 : 2, 0, Math.PI * 2);
      context.fillStyle = isEraser ? 'white' : currentColor;
      context.fill();
    }
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
    penSoundRef.current = new Howl({
      src: [pen_sound],
      volume: 0.3,
      sprite: {
        draw: [200, 220] // 200ms 지점부터 10ms 동안
      }
    });
  
    return () => {
      if (penSoundRef.current) {
        penSoundRef.current.unload();
      }
    };
  }, []);

  useEffect(() => {
    // 문서 어디서든 마우스 버튼을 떼면 상태 업데이트
    const handleDocumentMouseUp = () => {
      if (isDrawing) {
        // 그림판 밖에서도 마우스를 떼면 그리기 중지
        setIsDrawing(false);
        setHasCompleted(true);
        
        // 그림 저장
        saveCurrentDrawing();
        
        // 현재 플레이어가 그림을 그렸음을 표시
        const newHasDrawnInRound = [...hasDrawnInRound];
        newHasDrawnInRound[activeDrawerIndex] = true;
        setHasDrawnInRound(newHasDrawnInRound);
        
        // 소리 중지
        if (penSoundRef.current) {
          penSoundRef.current.stop();
        }
      }
      setIsMouseButtonDown(false);
    };
    
    // 문서 어디서든 마우스 버튼을 누르면 상태 업데이트
    const handleDocumentMouseDown = () => {
      setIsMouseButtonDown(true);
    };
    
    // 이벤트 리스너 등록
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('mousedown', handleDocumentMouseDown);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [isDrawing, activeDrawerIndex, hasDrawnInRound, saveCurrentDrawing]);

  useEffect(() => {
    // 로그 추가
    // console.log(`라운드 또는 활성 드로어 변경: 라운드=${currentRound}, 드로어 인덱스=${activeDrawerIndex}`);
    
    // 새 라운드가 시작될 때 (activeDrawerIndex === 0)
    if (activeDrawerIndex === 0) {
      // console.log(`새 라운드 시작: ${currentRound}라운드`);
      setDrawingHistory([]);
      setHasDrawnInRound([false, false, false]);
      setHasCompleted(false);
      setDrawingPoints([]);  // 그리기 포인트도 초기화
      setAllDrawingData({}); // 전체 그리기 데이터도 초기화
      
      if (canvasRef.current && context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [currentRound, activeDrawerIndex]);


  useEffect(() => {
    if (!context || !canvasRef.current || Object.keys(receivedDrawingData).length === 0) return;
  
    if (!isDrawing) {
      Object.entries(receivedDrawingData).forEach(([userIdStr, points]) => {
        // 빈 배열인 경우 지우기 이벤트로 처리
        if (points.length === 0) return;
        
        // 타임스탬프로 정렬 (순서 보장)
        const sortedPoints = [...points].sort((a, b) => 
          (a.timestamp || 0) - (b.timestamp || 0)
        );
        
        // 선 시작점을 찾아 별도의 그룹으로 분리
        let strokeGroups: DrawPoint[][] = [];
        let currentGroup: DrawPoint[] = [];
        
        sortedPoints.forEach(point => {
          if (point.isNewStroke && currentGroup.length > 0) {
            // 새 선 시작 - 이전 그룹 저장하고 새 그룹 시작
            strokeGroups.push([...currentGroup]);
            currentGroup = [point];
          } else {
            // 기존 선 계속 - 현재 그룹에 점 추가
            currentGroup.push(point);
          }
        });
        
        // 마지막 그룹 추가
        if (currentGroup.length > 0) {
          strokeGroups.push(currentGroup);
        }
        
        // 각 그룹(선)을 별도로 그리기
        strokeGroups.forEach(group => {
          if (group.length < 2) return; // 점이 2개 미만이면 선을 그릴 수 없음
          
          context.beginPath();
          context.strokeStyle = 'black';
          context.lineWidth = 5;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          
          // 시작점으로 이동
          context.moveTo(group[0].x, group[0].y);
          
          // 나머지 점으로 선 그리기
          for (let i = 1; i < group.length; i++) {
            context.lineTo(group[i].x, group[i].y);
          }
          
          context.stroke();
        });
      });
  
      // 그린 후 데이터 초기화
      setReceivedDrawingData({});
    }
  }, [receivedDrawingData, context, isDrawing, canvasRef]);
  

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
  }, [currentRound, activeDrawerIndex, context]);
  
  // 컴포넌트 마운트 시 한 번 모든 그림 렌더링
  useEffect(() => {
    renderAllDrawings();
  }, []);
  
  return (
    <div className="h-full flex flex-col bg-gray-300">
      {/* 타이머 바 */}
      <div className="w-full h-5 bg-gray-200 relative">
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold text-xs z-10">
            {timeLeft}초
          </span>
        <div 
          className={`h-full absolute top-0 left-0 z-9 ${
            timeLeft <= 5 
              ? 'bg-red-500 animate-[pulse_0.5s_ease-in-out_infinite]' 
              : timeLeft <= 10 
                ? 'bg-yellow-300' 
                : 'bg-green-300'
          }`}
          style={{ 
            width: `${timerBarWidth}%`,
            transition: 'width 1s linear',
          }}
        >
          {/* 타이머 바 안에 텍스트 추가 */}
        </div>
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
          
          
          {/* 이미 그림을 그렸음을 알리는 오버레이 */}
          {hasCurrentPlayerDrawn && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-700 text-white px-4 py-1 rounded-full text-sm font-medium">
              이미 그림을 그렸습니다. 순서를 넘기세요!
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
                    initialColor={'#000000'}  // 기본 색상을 검정색으로 설정
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
            순서 넘기기
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
  
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

export default CanvasSection;