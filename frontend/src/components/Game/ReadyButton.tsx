import React, { useEffect, useState } from 'react';
import { Player } from '../../utils/GameSocketUtils';

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
  maxPlayers = 4
}) => {
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
  }, [localIsHost, customIsHost, currentUser, allPlayersReady]);

  if (!currentUser) return null;
  
  // customReadyState가 제공되면 이를 사용, 아니면 currentUser.isReady 사용
  const isReady = customReadyState !== undefined ? customReadyState : currentUser.isReady;
  
  return (
    <div className="w-full flex flex-col justify-center items-center">
      {localIsHost ? (
        // 방장인 경우: 시작 버튼만 표시
        <button
          onClick={onStartGame}
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