import React, { useEffect, useState } from 'react';
import { Player } from '../../utils/GameSocketUtils';
import { useNavigate, useParams } from 'react-router-dom';

interface ReadyButtonProps {
  currentUser: Player | null;
  isConnected: boolean;
  allPlayersReady: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
  customReadyState?: boolean;
  customIsHost?: boolean;
  playerCount?: number;
  maxPlayers?: number;
  roomId?: string;
  sessionId?: string;  // sessionId 추가
}

const ReadyButton: React.FC<ReadyButtonProps> = ({
  currentUser,
  isConnected,
  allPlayersReady,
  onToggleReady,
  onStartGame,
  customReadyState,
  customIsHost,
  playerCount = 0,
  maxPlayers = 4,
  roomId: propRoomId,
  sessionId: propSessionId,  // props에서 sessionId 받기
}) => {
  const navigate = useNavigate();
  // URL 파라미터에서 roomId 가져오기
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  
  // 실제 사용할 roomId와 sessionId 상태
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // 내부 상태
  const [localIsHost, setLocalIsHost] = useState<boolean>(false);
  
  // roomId와 sessionId 초기화
  useEffect(() => {
    // 1. sessionId 설정 (props > localStorage)
    const storedSessionId = localStorage.getItem('sessionId');
    const sessionIdToUse = propSessionId || storedSessionId || null;
    
    // 2. roomId 설정 (URL 파라미터 > props > localStorage)
    const storedRoomId = localStorage.getItem('roomId');
    const roomIdToUse = paramRoomId || propRoomId || storedRoomId || null;
    
    console.log('ReadyButton - 초기화:');
    console.log('- URL 파라미터 roomId:', paramRoomId);
    console.log('- Props roomId:', propRoomId);
    console.log('- localStorage roomId:', storedRoomId);
    console.log('- 최종 roomId:', roomIdToUse);
    console.log('- Props sessionId:', propSessionId);
    console.log('- localStorage sessionId:', storedSessionId);
    console.log('- 최종 sessionId:', sessionIdToUse);
    
    setRoomId(roomIdToUse);
    setSessionId(sessionIdToUse);
    
    // 값이 유효하면 localStorage에 저장
    if (roomIdToUse) {
      localStorage.setItem('roomId', roomIdToUse);
    }
    if (sessionIdToUse) {
      localStorage.setItem('sessionId', sessionIdToUse);
    }
  }, [paramRoomId, propRoomId, propSessionId]);
  
  // 마운트 시 isHost 확인
  useEffect(() => {
    // 방장 상태 확인
    const storedIsHost = localStorage.getItem('isHost') === 'true';
    console.log('ReadyButton - localStorage에서 isHost 값 확인:', storedIsHost);
    
    // customIsHost가 지정되어 있지 않고, localStorage에 방장 정보가 있는 경우
    if (customIsHost === undefined && storedIsHost) {
      setLocalIsHost(true);
    }
  }, [customIsHost]);
  
  // customIsHost 값이 변경될 때마다 내부 상태 업데이트
  useEffect(() => {
    if (customIsHost !== undefined) {
      console.log('ReadyButton - customIsHost 변경됨:', customIsHost);
      setLocalIsHost(customIsHost);
    }
  }, [customIsHost]);
  
  // currentUser가 변경될 때 isHost 확인
  useEffect(() => {
    if (currentUser && currentUser.isHost !== undefined) {
      console.log('ReadyButton - currentUser.isHost 확인:', currentUser.isHost);
      
      // customIsHost가 제공되지 않았을 때만 currentUser.isHost 값을 사용
      if (customIsHost === undefined) {
        setLocalIsHost(currentUser.isHost);
      }
    }
  }, [currentUser, customIsHost]);
  
  // 디버깅용 렌더링 로그
  useEffect(() => {
    console.log('ReadyButton 렌더링 - 현재 상태:');
    console.log('roomId:', roomId);
    console.log('sessionId:', sessionId);
    console.log('localIsHost:', localIsHost);
    console.log('customIsHost:', customIsHost);
    console.log('currentUser?.isHost:', currentUser?.isHost);
    console.log('allPlayersReady:', allPlayersReady);
  }, [roomId, sessionId, localIsHost, customIsHost, currentUser, allPlayersReady]);

  if (!currentUser) return null;
  
  // 시작 버튼 클릭 핸들러 - 이제 sessionId를 우선적으로 사용
  const handleStartGame = () => {
    // 기존 onStartGame 호출하여 웹소켓 메시지 전송
    onStartGame();
    
    // 게임 페이지로 이동 - sessionId가 있으면 사용, 없으면 roomId 사용
    const idToUse = sessionId || roomId;
    
    if (idToUse) {
      console.log(`게임 시작: /game/${idToUse}로 이동합니다.`);
      
      // 로컬 스토리지에 sessionId와 roomId 저장 (게임 페이지에서 사용)
      if (sessionId) localStorage.setItem('sessionId', sessionId);
      if (roomId) localStorage.setItem('roomId', roomId);
      
      // 약간의 지연 후 이동 (웹소켓 메시지가 전송될 시간 확보)
      setTimeout(() => {
        navigate(`/game/${idToUse}`);
      }, 500);
    } else {
      // 식별자가 없으면 기본 경로로 이동
      console.log('식별자가 없습니다. 기본 게임 페이지로 이동합니다.');
      navigate('/game');
    }
  };

  // customReadyState가 제공되면 이를 사용, 아니면 currentUser.isReady 사용
  const isReady = customReadyState !== undefined ? customReadyState : currentUser.isReady;
  
  return (
    <div className="w-full flex flex-col justify-center items-center">
      {localIsHost ? (
        // 방장인 경우: 시작 버튼만 표시
        <button
          onClick={handleStartGame}
          disabled={!allPlayersReady || !isConnected || playerCount < 2}
          className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
            allPlayersReady && isConnected && playerCount >= 2
              ? 'bg-[#ffd62e]' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          시작
        </button>
      ) : (
        // 일반 플레이어인 경우: 준비 버튼 표시
        <button
          onClick={onToggleReady}
          disabled={!isConnected}
          className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
            !isConnected
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : isReady 
                ? 'bg-red-500 text-white' 
                : 'bg-[#ffd62e] text-black'
          }`}
        >
          {isReady ? '취소' : '준비'}
        </button>
      )}
    </div>
  );
};

export default ReadyButton;