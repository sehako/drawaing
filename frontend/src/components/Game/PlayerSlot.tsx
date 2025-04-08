import React from 'react';
import { Player } from '../../utils/GameSocketUtils';

interface PlayerSlotProps {
  player: Player | null;
  index: number;
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({ player, index }) => {
  return (
    <div 
      className="flex flex-col items-center bg-amber-400 rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-2 sm:p-4 relative h-[500px]"
    >
      {player ? (
        <>
          {/* 플레이어 정보 */}
          <div className="w-full h-full flex flex-col items-center justify-between">

            {/* 플레이어 라벨 (예: Player 1, Player 2, ...) */}
            <div className="text-black text-3xl sm:text-3xl md:text-3xl font-bold font-['Press_Start_2P'] mt-5">
              {`Player ${index + 1}`}
            </div>
            
            {/* 캐릭터 이미지 컨테이너 */}
            <div className="relative w-full h-80% flex-grow flex items-center justify-center mb-1 mb-5">
              {/* 방장 왕관 표시 */}
              {player.isHost && (
                <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)] z-10 mt-[40px]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L9 9H2L7 14.5L5 22L12 17.5L19 22L17 14.5L22 9H15L12 1Z" />
                  </svg>
                </div>
              )}
              
              {/* 캐릭터 이미지 */}
              <div className="relative w-full aspect-square mb-[-35px]">
                <img 
                  src={player.character || player.characterUrl || "https://placehold.co/400x400"} 
                  alt={`${player.nickname} 캐릭터`}
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black"
                />
                
              {/* READY 오버레이 */}
              {player.isReady && !player.isHost && (
                <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center">
                  <div className="text-red-600 text-xl sm:text-3xl md:text-5xl font-black font-['Press_Start_2P'] filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">READY</div>
                </div>
              )}
            </div>
            </div>
            
          {/* 닉네임 */}
          <div className="w-full mt-1 mb-[20px]">
            <div className="bg-white text-black text-2xl text-base sm:text-2xl md:text-xl font-bold font-['Press_Start_2P'] text-center px-2 h-[60px] rounded-[10px] border-4 border-black flex items-center justify-center w-full">
              {player.nickname}
            </div>
          </div>
        </div>
        </>
      ) : (
        // 빈 슬롯
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-amber-700 text-xs sm:text-sm md:text-lg lg:text-xl font-bold font-['Press_Start_2P']">빈 자리</p>
        </div>
      )}
    </div>
  );
};

export default PlayerSlot;