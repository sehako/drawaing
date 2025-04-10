import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Type definitions
interface PlayerResult {
  winCnt: number;
  point: number;
  score: number;
  exp: number;
}

interface PlayerInfo {
  memberId: string;
  nickname: string;
  characterUrl: string;
}

interface ProcessedPlayerData {
  player: PlayerInfo;
  result: PlayerResult;
  rank: number;
}

interface SessionResultData {
  [memberId: string]: {
    winCnt: number;
    point: number;
    score: number;
    exp: number;
  }
}

interface PlayerResultProps {
  player: PlayerInfo;
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
            <h3 className="text-xl font-bold mb-1">점수</h3>
            <p>점수 = 사람 이긴 횟수×2 - 진 횟수×2 + 그림 추가 점수 + 맞췄을 때 추가 점수</p>
            <ul className="list-disc pl-5 mt-2">
              <li>그림 추가 점수: <br />(참여자 수-그림 번째)×2 → 현재 4명 기준 6, 4, 2점</li>
              <li>맞췄을 때 추가 점수: <br />(라운드 총 시간-라운드 지난 시간)÷10 → 0~6점</li>
              <ul className="list-disc pl-5 mt-1">
                <li>라운드 총 시간: <br />그림 그리는 시간 × (참여자 수-1)</li>
                <li>라운드 지난 시간: <br />(그림 그리는 시간-남은 시간) + 그림 번째×그림 그리는 시간</li>
              </ul>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-1">계란</h3>
            <p>기본 계란 갯수(10) + 이긴 라운드 - 진 라운드</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-1">경험치</h3>
            <p>최소 경험치(10) + 이긴 라운드 수×1 + 이겼을 때 보너스 경험치(10)</p>
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

// Player Result Card Component
const PlayerResultCard: React.FC<PlayerResultProps> = ({ player, result, rank }) => {
  // 순위에 따른 배경 색상 설정
  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400'; // 금색
      case 2: return 'bg-gray-200';  // 은색
      case 3: return 'bg-[#CD7F32]'; // 동색
      default: return 'bg-stone-400'; // 돌색
    }
  };

  return (
    <div 
      className={`flex flex-col items-center ${getRankBgColor(rank)} rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-2 sm:p-4 relative h-full`}
    >
      {/* 플레이어 정보 */}
      <div className="w-full h-full flex flex-col items-center justify-between gap-2">
        {/* 순위 메달 표시 */}
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center justify-center w-20 h-10 rounded-full bg-white border-4 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <span className="text-2xl font-bold text-black">{rank}등</span>
          </div>
        </div>

        {/* 닉네임 */}
        <div className="relative w-full flex-grow flex items-center justify-center mt-2">
          <div className="text-black text-lg sm:text-xl font-bold text-center truncate">
            {player.nickname}
          </div>
        </div>

        {/* 캐릭터 이미지 컨테이너 */}
        <div className="relative w-full flex-grow flex items-center justify-center">
          {/* 캐릭터 이미지 */}
          <div className="relative w-full aspect-square">
            <img 
              src={player.characterUrl || "https://placehold.co/400x400"} 
              alt={`${player.nickname} 캐릭터`}
              className="w-full h-full object-cover rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black"
            />
          </div>
        </div>

        {/* 총점 오버레이 */}
        <div className="relative w-full flex-grow flex items-center justify-center">
          {/* 나무 판자 배경 */}
          <div className="relative bg-amber-800 rounded-lg px-4 py-1 transform rotate-1 border-4 border-amber-900 shadow-[5px_5px_0_0_rgba(0,0,0,0.3)]">
            {/* 나뭇결 효과 */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-1 bg-amber-950 rounded-full my-1"></div>
              <div className="w-full h-1 bg-amber-950 rounded-full my-2"></div>
              <div className="w-full h-1 bg-amber-950 rounded-full my-3"></div>
            </div>

            {/* 총점 텍스트 */}
            <div className="flex items-center justify-center">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                {result.score}점
              </span>
            </div>
          </div>
        </div>

        {/* 결과 통계 */}
        <div className="w-full flex flex-col gap-1 sm:gap-2">
          <div className="bg-white rounded-lg border-2 border-black p-2 text-center flex flex-row gap-14">
            <p className="text-lg font-bold text-amber-800">승리 :</p>
            <p className="text-lg font-bold text-amber-900">{result.winCnt}회</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-black p-2 text-center flex flex-row gap-14">
            <p className="text-lg font-bold text-amber-800">계란 :</p>
            <p className="text-lg font-bold text-amber-900">{result.point}개</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-black p-2 text-center flex flex-row gap-9">
            <p className="text-lg font-bold text-amber-800">경험치 :</p>
            <p className="text-lg font-bold text-amber-900">{result.exp}XP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 게임 결과 표시 페이지
const GameResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("닭장");
  const [playersData, setPlayersData] = useState<ProcessedPlayerData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalHumanWins, setTotalHumanWins] = useState<number>(0);
  const [totalAIWins, setTotalAIWins] = useState<number>(0);
  
  // 컴포넌트 마운트 시 세션 결과 데이터 로드
  useEffect(() => {
    const loadResultData = () => {
      try {
        setIsLoading(true);
        
        // 로컬 스토리지에서 세션 결과 데이터 가져오기
        const storedResultData = localStorage.getItem('sessionResultData');
        const storedRoomName = localStorage.getItem('roomTitle') || "닭장";
        
        if (storedResultData) {
          console.log('세션 결과 데이터 로드:', storedResultData);
          
          // 세션 결과 데이터 파싱
          const resultData: SessionResultData = JSON.parse(storedResultData);
          
          // 플레이어 정보 결합
          const storedPlayersList = localStorage.getItem('playersList');
          
          if (storedPlayersList) {
            const playersList = JSON.parse(storedPlayersList);
            processResultData(resultData, playersList);
          } else {
            // 플레이어 리스트가 없을 경우 memberId로만 처리
            const defaultPlayers = Object.keys(resultData).map(memberId => ({
              id: memberId,
              nickname: `플레이어 ${memberId}`,
              characterUrl: `https://placehold.co/400x400?text=P${memberId}`
            }));
            processResultData(resultData, defaultPlayers);
          }
        } else {
          // 로컬 스토리지에 결과 데이터가 없는 경우 처리
          console.log('세션 결과 데이터가 없습니다. 테스트 데이터를 로드합니다.');
          
          // 테스트 데이터 사용
          const testData: SessionResultData = {
            "1": { winCnt: 5, point: 10, score: 200, exp: 20 },
            "2": { winCnt: 3, point: 8, score: 150, exp: 15 },
            "3": { winCnt: 4, point: 9, score: 180, exp: 18 },
            "4": { winCnt: 2, point: 6, score: 120, exp: 12 }
          };
          
          // 테스트 플레이어 데이터
          const testPlayers = [
            { id: "1", nickname: "플레이어1", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon1.gif" },
            { id: "2", nickname: "플레이어2", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon2.png" },
            { id: "3", nickname: "플레이어3", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon3.jpg" },
            { id: "4", nickname: "플레이어4", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon4.jpg" }
          ];
          
          processResultData(testData, testPlayers);
        }
        
        setRoomName(storedRoomName);
        setIsLoading(false);
      } catch (error) {
        console.error('결과 데이터 로드 중 오류 발생:', error);
        setError('결과 데이터를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    loadResultData();
    
    // 컴포넌트 언마운트 시 로컬 스토리지 정리
    return () => {
      // 페이지를 떠날 때 세션 결과 데이터 삭제 (선택 사항)
      // localStorage.removeItem('sessionResultData');
    };
  }, [roomId]);
  
  // 세션 결과 데이터와 플레이어 정보 처리
  const processResultData = (resultData: SessionResultData, playersList: any[]) => {
    try {
      // 총 인간 승리 횟수 계산
      let totalWins = 0;
      
      // 플레이어 데이터 가공
      const processedPlayers: ProcessedPlayerData[] = Object.entries(resultData).map(([memberId, result]) => {
        // 해당 멤버의 플레이어 정보 찾기
        const playerInfo = playersList.find(p => p.id === memberId || p.id.toString() === memberId);
        
        // 승리 횟수 누적
        totalWins += result.winCnt || 0;
        
        return {
          player: {
            memberId,
            nickname: playerInfo?.nickname || `플레이어 ${memberId}`,
            characterUrl: playerInfo?.characterUrl || `https://placehold.co/400x400?text=P${memberId}`
          },
          result: {
            winCnt: result.winCnt || 0,
            point: result.point || 0,
            score: result.score || 0,
            exp: result.exp || 0
          },
          rank: 0 // 임시 순위, 정렬 후 할당
        };
      });
      
      // 점수순으로 정렬하고 순위 부여
      const rankedPlayers = processedPlayers
        .sort((a, b) => b.result.score - a.result.score)
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }));
      
      setPlayersData(rankedPlayers);
      
      // 총 라운드 수를 10으로 가정하고 AI 승리 횟수 계산
      // 실제 라운드 수가 있다면 그 값을 사용해야 함
      const totalRounds = 10; // 예시 값
      const aiWins = totalRounds - totalWins;
      
      setTotalHumanWins(totalWins);
      setTotalAIWins(aiWins);
      
    } catch (error) {
      console.error('결과 데이터 처리 중 오류:', error);
      setError('결과 데이터 처리 중 오류가 발생했습니다.');
    }
  };
  
  // 대기실로 돌아가기 처리
  const handleReturnToWaitingRoom = () => {
    const storedRoomCode = localStorage.getItem('roomCode');
    if (storedRoomCode) {
      navigate(`/waiting-room/${storedRoomCode}`);
    } else {
      // 룸 코드가 없는 경우 홈으로 리다이렉트
      navigate('/');
    }
  };
  
  // 로딩 중 UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-100 to-amber-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-amber-800 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-amber-800">게임 결과를 불러오는 중...</h2>
        </div>
      </div>
    );
  }
  
  // 에러 UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-100 to-amber-200">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">{error}</h2>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-3 bg-amber-500 rounded-full text-white font-bold hover:bg-amber-600 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
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
        {/* 헤더 */}
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
              
              {/* 게임 결과 텍스트 - 원래 방 이름 포함 */}
              <div className="flex flex-col items-start">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                  {roomName} - 게임 결과
                </h1>
                {/* <div className="text-amber-200 text-sm sm:text-base">
                  사람 {totalHumanWins}승 vs AI {totalAIWins}승
                </div> */}
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
        
        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 flex-grow">
          {playersData.map((playerData) => (
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