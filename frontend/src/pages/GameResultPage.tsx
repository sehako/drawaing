import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useUserWebSocket from '../hooks/useUserWebSocket';

// Type definitions
interface PlayerResult {
  winCnt: number;
  point: number;
  score: number;
  exp?: number;
}

interface GameResults {
  [memberId: string]: PlayerResult;
}

interface PlayerResultProps {
  player: any;
  result: PlayerResult;
  rank: number;
}

// Score Explanation Modal Component
const ScoreExplanationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      <div className="relative z-50 bg-amber-100 p-8 rounded-xl shadow-2xl border-4 border-amber-600 max-w-lg w-full mx-4">
        <h2 className="text-3xl font-bold mb-4 text-amber-800">점수 계산 방식</h2>
        
        <div className="space-y-4 text-amber-900">
          <div>
            <h3 className="text-xl font-bold mb-1">라운드 승리</h3>
            <p>각 라운드에서 이긴 횟수를 나타냅니다. 라운드에서 승리할 때마다 승리 카운트가 올라갑니다.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-1">획득 계란</h3>
            <p>게임을 통해 획득한 계란의 총 개수입니다. 계란은 특별한 게임 보상으로 사용됩니다.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-1">랭킹 점수</h3>
            <p>랭킹 시스템에 반영되는 점수입니다. 계산 공식:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>기본 점수: 참여 보너스 10점</li>
              <li>승리 보너스: 라운드 승리당 20점</li>
              <li>계란 보너스: 획득 계란당 5점</li>
            </ul>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 w-full py-3 bg-red-500 rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 text-white font-bold transition-all duration-200"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

// Player Result Card Component - PlayerSlot 스타일 적용
const PlayerResultCard: React.FC<PlayerResultProps> = ({ player, result, rank }) => {
  // 순위에 따른 배경 색상 설정
  const getRankBgColor = (rank: number) => {
    switch(rank) {
      case 1: return 'bg-yellow-400';
      case 2: return 'bg-gray-300';
      case 3: return 'bg-amber-500';
      default: return 'bg-amber-400';
    }
  };

  return (
    <div 
      className={`flex flex-col items-center ${getRankBgColor(rank)} rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-2 sm:p-4 relative h-full`}
    >
      {/* 플레이어 정보 */}
      <div className="w-full h-full flex flex-col items-center justify-between">
        {/* 순위 메달 표시 */}
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-12 sm:h-12 text-red-500 filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)] z-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-4 border-black">
            <span className="text-2xl font-bold">{rank}</span>
          </div>
        </div>
        
        {/* 캐릭터 이미지 컨테이너 */}
        <div className="relative w-full flex-grow flex items-center justify-center mb-1 sm:mb-2">
          {/* 캐릭터 이미지 */}
          <div className="relative w-full aspect-square">
            <img 
              src={player.characterUrl || "/images/default-avatar.png"} 
              alt={`${player.nickname} 캐릭터`}
              className="w-full h-full object-cover rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black"
            />
            
            {/* 총점 오버레이 */}
            <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-black bg-opacity-70 text-white text-lg sm:text-xl px-2 py-1 rounded-lg font-bold">{result.score}점</div>
            </div>
          </div>
        </div>
        
        {/* 닉네임 */}
        <div className="w-full mt-1">
          <div className="text-black text-lg sm:text-xl font-bold text-center truncate">
            {player.nickname}
          </div>
        </div>
        
        {/* 결과 통계 */}
        <div className="w-full mt-2 grid grid-cols-3 gap-1 sm:gap-2">
          <div className="bg-white rounded-lg border-2 border-black p-1 text-center">
            <p className="text-xs font-bold text-amber-800">승리</p>
            <p className="text-lg font-bold text-amber-900">{result.winCnt}회</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-black p-1 text-center">
            <p className="text-xs font-bold text-amber-800">계란</p>
            <p className="text-lg font-bold text-amber-900">{result.point}개</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-black p-1 text-center">
            <p className="text-xs font-bold text-amber-800">점수</p>
            <p className="text-lg font-bold text-amber-900">{result.score}점</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const { isAuthenticated, user } = useAuth();
  
  const [gameResults, setGameResults] = useState<GameResults>({});
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rankSortedPlayers, setRankSortedPlayers] = useState<{player: any, result: PlayerResult, rank: number}[]>([]);

  // Reuse the existing WebSocket hook
  const {
    stompClient,
    isConnected,
    players,
    currentUser,
    sessionId
  } = useUserWebSocket({
    roomId: roomId || '',
    user,
    isAuthenticated,
    isLoading
  });

  // Effect to listen for game results via WebSocket
  useEffect(() => {
    if (!stompClient || !isConnected || !roomId || !sessionId) {
      console.log('WebSocket not ready yet or missing required parameters');
      return;
    }

    console.log(`Subscribing to result topic: /topic/session.result/${roomId}/${sessionId}`);
    
    // Subscribe to game results topic
    const subscription = stompClient.subscribe(`/topic/session.result/${roomId}/${sessionId}`, (message) => {
      try {
        const resultData = JSON.parse(message.body);
        console.log('Received game results:', resultData);
        setGameResults(resultData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing game results:', error);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    };
  }, [stompClient, isConnected, roomId, sessionId]);

  // Process and sort players by score when players or results change
  useEffect(() => {
    if (Object.keys(gameResults).length === 0 || players.length === 0) {
      return;
    }
    
    console.log('Processing player rankings...');
    
    // Create a sorted player list with ranks
    const playersWithResults = players
      .filter(player => gameResults[player.memberId])
      .map(player => ({
        player,
        result: gameResults[player.memberId],
        score: gameResults[player.memberId].score || 0
      }))
      .sort((a, b) => b.score - a.score);

    // Add rank to each player
    const rankedPlayers = playersWithResults.map((item, index) => ({
      player: item.player,
      result: item.result,
      rank: index + 1
    }));

    setRankSortedPlayers(rankedPlayers);
  }, [gameResults, players]);

  // Handle returning to waiting room
  const handleReturnToWaitingRoom = () => {
    // Navigate back to waiting room while keeping the WebSocket connection
    navigate(`/waiting-room/${roomId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-amber-50">
        <div className="text-2xl font-bold">결과 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-amber-50">
      {/* Score explanation modal */}
      {showExplanationModal && (
        <ScoreExplanationModal onClose={() => setShowExplanationModal(false)} />
      )}

      {/* Background image */}
      <div className="fixed inset-0 w-full h-full z-0">
        <img 
          className="w-full h-full object-cover"
          src="/images/chicken-background.jpg" 
          alt="닭장 배경"
        />
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-800/50"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto p-4 sm:p-6">
        {/* 헤더 (GameRoomHeader 스타일 적용) */}
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
              
              {/* 게임 결과 텍스트 */}
              <div className="flex flex-col items-start">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                  게임 결과
                </h1>
              </div>
              
              {/* 나무 판자 못 효과 */}
              <div className="absolute -top-2 -left-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
              <div className="absolute -bottom-2 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
            </div>
          </div>
          
          {/* 버튼 그룹 */}
          <div className="flex space-x-2">
            {/* 점수 계산 방식 버튼 */}
            <button 
              onClick={() => setShowExplanationModal(true)}
              className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-blue-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
            >
              점수 계산 방식
            </button>
            
            {/* 대기실로 돌아가기 버튼 */}
            <button 
              onClick={handleReturnToWaitingRoom}
              className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-red-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
            >
              대기실로 돌아가기
            </button>
          </div>
        </div>
        
        {/* Results grid - PlayerSlot과 동일한 스타일 적용 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 flex-grow">
          {rankSortedPlayers.map((playerData) => (
            <PlayerResultCard 
              key={playerData.player.memberId}
              player={playerData.player}
              result={playerData.result}
              rank={playerData.rank}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameResultPage;