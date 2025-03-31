import React, { useEffect, useState } from 'react';
import { Player } from '../../utils/GameSocketUtils';
import { useNavigate } from 'react-router-dom';

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
  roomId?: string; // roomId 추가
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
  roomId, 
}) => {
  const navigate = useNavigate(); // useNavigate 훅 추가

  // 컴포넌트 내부 상태 추가 - props 변경에 즉시 반응하기 위함
  const [localIsHost, setLocalIsHost] = useState<boolean>(false);
  
  // 마운트 시 localStorage 확인
  useEffect(() => {
    const storedIsHost = localStorage.getItem('isHost') === 'true';
    console.log('ReadyButton - localStorage에서 isHost 값 확인:', storedIsHost);
    
    // customIsHost가 지정되어 있지 않고, localStorage에 방장 정보가 있는 경우
    if (customIsHost === undefined && storedIsHost) {
      setLocalIsHost(true);
    }
  }, []);
  
  // customIsHost 값이 변경될 때마다 내부 상태 업데이트
  useEffect(() => {
    console.log('ReadyButton - customIsHost 변경됨:', customIsHost);
    
    if (customIsHost !== undefined) {
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
    console.log('localIsHost:', localIsHost);
    console.log('customIsHost:', customIsHost);
    console.log('currentUser?.isHost:', currentUser?.isHost);
    console.log('allPlayersReady:', allPlayersReady);
    console.log('roomId:', roomId);
  }, [localIsHost, customIsHost, currentUser, allPlayersReady, roomId]);

  if (!currentUser) return null;
    // 시작 버튼 클릭 핸들러 수정
    const handleStartGame = () => {
      // 기존 onStartGame 호출하여 웹소켓 메시지 전송
      onStartGame();
      
      // 유효한 roomId가 있으면 해당 roomId로 게임 페이지로 이동
      if (roomId) {
        console.log(`게임 시작: /game/${roomId}로 이동합니다.`);
        
        // 약간의 지연 후 이동 (웹소켓 메시지가 전송될 시간 확보)
        setTimeout(() => {
          navigate(`/game/${roomId}`);
        }, 500);
      } else {
        // roomId가 없으면 기본 경로로 이동
        console.log('roomId가 없습니다. 기본 게임 페이지로 이동합니다.');
        navigate('/game');
      }
    };
  
    if (!currentUser) return null;

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