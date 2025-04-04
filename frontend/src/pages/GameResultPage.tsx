import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useUserWebSocket from '../hooks/useUserWebSocket';

// Type definitions
interface PlayerResult {
  winCnt: number;
  point: number;
  score: number;
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
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative z-50 bg-amber-100 p-8 rounded-xl shadow-2xl border-4 border-amber-500 max-w-lg w-full mx-4">
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
          className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition duration-200"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

// Player Result Card Component
const PlayerResultCard: React.FC<PlayerResultProps> = ({ player, result, rank }) => {
  // Custom colors for different ranks
  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return 'text-yellow-500'; // Gold
      case 2: return 'text-gray-400';   // Silver
      case 3: return 'text-amber-700';  // Bronze
      default: return 'text-gray-700';  // Default
    }
  };

  const getRankBgColor = (rank: number) => {
    switch(rank) {
      case 1: return 'bg-yellow-100';
      case 2: return 'bg-gray-100';
      case 3: return 'bg-amber-100';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`relative rounded-xl shadow-lg p-4 border-2 ${rank === 1 ? 'border-yellow-400' : (rank === 2 ? 'border-gray-400' : (rank === 3 ? 'border-amber-600' : 'border-gray-200'))} ${getRankBgColor(rank)}`}>
      {/* Rank Badge */}
      <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${rank === 1 ? 'bg-yellow-500' : (rank === 2 ? 'bg-gray-400' : (rank === 3 ? 'bg-amber-700' : 'bg-gray-500'))}`}>
        {rank}
      </div>
      
      {/* Player Info */}
      <div className="flex items-center mb-3">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500">
          <img 
            src={player?.characterUrl || "/images/default-avatar.png"} 
            alt="캐릭터" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-bold">{player?.nickname || "플레이어"}</h3>
          <p className={`font-bold ${getRankColor(rank)}`}>
            총점: {result.score}점
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-amber-50 p-2 rounded-lg">
          <p className="text-xs text-amber-700">라운드 승리</p>
          <p className="text-xl font-bold text-amber-900">{result.winCnt}회</p>
        </div>
        <div className="bg-amber-50 p-2 rounded-lg">
          <p className="text-xs text-amber-700">획득 계란</p>
          <p className="text-xl font-bold text-amber-900">{result.point}개</p>
        </div>
        <div className="bg-amber-50 p-2 rounded-lg">
          <p className="text-xs text-amber-700">랭킹 점수</p>
          <p className="text-xl font-bold text-amber-900">{result.score}점</p>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-800/30"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-amber-100 rounded-xl shadow-lg p-4 mb-6 border-2 border-amber-500 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-800">게임 결과</h1>
          <button
            onClick={() => setShowExplanationModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition duration-200"
          >
            점수 계산 방식
          </button>
        </div>
        
        {/* Results grid */}
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
        
        {/* Bottom button area */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleReturnToWaitingRoom}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition duration-200 shadow-lg"
          >
            대기실로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResultPage;