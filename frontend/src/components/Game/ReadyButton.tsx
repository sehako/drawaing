import React from 'react';
import { Player } from '../../utils/GameSocketUtils';

interface ReadyButtonProps {
  currentUser: Player | null;
  isConnected: boolean;
  allPlayersReady: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
}

const ReadyButton: React.FC<ReadyButtonProps> = ({
  currentUser,
  isConnected,
  allPlayersReady,
  onToggleReady,
  onStartGame
}) => {
  if (!currentUser) return null;

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {currentUser.isHost ? (
        <button
          onClick={onStartGame}
          disabled={!allPlayersReady || !isConnected}
          className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
            allPlayersReady && isConnected
              ? 'bg-[#ffd62e]' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          시작
        </button>
      ) : (
        <button
          onClick={onToggleReady}
          disabled={!isConnected}
          className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
            !isConnected
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : currentUser.isReady 
                ? 'bg-red-500 text-white' 
                : 'bg-[#ffd62e] text-black'
          }`}
        >
          {currentUser.isReady ? '취소' : '준비'}
        </button>
      )}
    </div>
  );
};

export default ReadyButton;