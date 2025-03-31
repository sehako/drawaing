import React from 'react';

interface GameRoomHeaderProps {
  roomName: string;
  displayRoomCode: string | null;
  isConnected: boolean;
  onShowInstructions: () => void;
  onLeaveRoom: () => void;
}

const GameRoomHeader: React.FC<GameRoomHeaderProps> = ({
  roomName,
  displayRoomCode,
  isConnected,
  onShowInstructions,
  onLeaveRoom
}) => {
  return (
    <div className="flex justify-between items-center mb-6 z-20">
      {/* 방 이름 나무 판자 */}
      <div className="relative">
        {/* 나무 판자 배경 */}
        <div className="relative bg-amber-800 rounded-lg px-4 py-3 transform rotate-1 border-4 border-amber-900 shadow-[5px_5px_0_0_rgba(0,0,0,0.3)]">
          {/* 나뭇결 효과 */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-1 bg-amber-950 rounded-full my-1"></div>
            <div className="w-full h-1 bg-amber-950 rounded-full my-2"></div>
            <div className="w-full h-1 bg-amber-950 rounded-full my-3"></div>
            <div className="w-full h-1 bg-amber-950 rounded-full my-1"></div>
            <div className="w-full h-1 bg-amber-950 rounded-full my-2"></div>
          </div>
          
          {/* 방 이름 텍스트 */}
          <div className="flex flex-col items-start">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-['Press_Start_2P'] text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              {roomName} <span className="mt-1 text-xs sm:text-sm text-amber-200">방 코드: {displayRoomCode || '로딩 중...'}</span>
            </h1>
          </div>
          
          {/* 나무 판자 못 효과 */}
          <div className="absolute -top-2 -left-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
          <div className="absolute -bottom-2 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
        </div>
      </div>
      
      {/* 연결 상태 표시 */}
      <div className={`absolute -top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {isConnected ? '연결됨' : '연결 중...'}
      </div>
      
      {/* 버튼 그룹 */}
      <div className="flex space-x-2">
        {/* 게임 설명 버튼 */}
        <button 
          onClick={onShowInstructions}
          className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-blue-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
        >
          게임 설명
        </button>
        
        {/* 방 나가기 버튼 */}
        <button 
          onClick={onLeaveRoom}
          className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-red-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
        >
          방 나가기
        </button>
      </div>
    </div>
  );
};

export default GameRoomHeader;