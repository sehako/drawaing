import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameRoomHeader } from '../components/Game';

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

interface PlayerResultProps {
  player: PlayerInfo;
  result: PlayerResult;
  rank: number;
}

interface HardcodedGameResultPageProps {
  roomTitle?: string; // 방 이름 (옵션)
  playersData: Array<{
    player: PlayerInfo;
    result: PlayerResult;
  }>;
}

// 넘겨줄 데이터 형식
const mockPlayersData = [
  {
    player: { memberId: "1", nickname: "플레이어1", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon1.gif" },
    result: { winCnt: 5, point: 10, score: 200, exp: 20 },
  },
  {
    player: { memberId: "2", nickname: "플레이어2", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon2.png" },
    result: { winCnt: 3, point: 8, score: 150, exp: 15 },
  },
  {
    player: { memberId: "3", nickname: "플레이어3", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon3.jpg" },
    result: { winCnt: 4, point: 9, score: 180, exp: 18 },
  },
  {
    player: { memberId: "4", nickname: "플레이어4", characterUrl: "https://drawaing-bucket.s3.ap-northeast-2.amazonaws.com/images/emoticon/emoticon4.jpg" },
    result:{ winCnt : 2, point: 6, score: 120, exp: 12 },
  },
]

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

// Player Result Card Component - PlayerSlot 스타일 적용
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


const HardcodedGameResultPage: React.FC<HardcodedGameResultPageProps> = ({
  roomTitle = "닭장", // 기본 방 이름 설정
  playersData = mockPlayersData, // 하드코딩된 플레이어 데이터
}) => {
  const navigate = useNavigate();
  //const { roomId } = useParams();
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>(roomTitle);
  
  // 정렬된 플레이어 데이터 생성
  const rankSortedPlayers = playersData
    .sort((a, b) => b.result.score - a.result.score) // 점수를 기준으로 내림차순 정렬
    .map((data, index) => ({
      ...data,
      rank: index + 1, // 순위 부여
    }));


  // 컴포넌트가 마운트될 때 localStorage에서 원래 방 이름 가져오기
  useEffect(() => {
    const storedRoomName = localStorage.getItem('roomTitle');
    if (storedRoomName) {
      setRoomName(storedRoomName);
    } else {
      // 방 이름이 없는 경우 기본값 설정
      setRoomName("닭장");
    }
  }, []);

  // Handle returning to waiting room
  const handleReturnToWaitingRoom = () => {
    const storedRoomCode = localStorage.getItem('roomCode');
    if (storedRoomCode) {
      navigate(`/waiting-room/${storedRoomCode}`);
    } else {
      // 룸 코드가 없는 경우 홈으로 리다이렉트
      navigate('/');
    }
  };

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
              
              {/* 게임 결과 텍스트 - 원래 방 이름 포함 */}
              <div className="flex flex-col items-start">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                  {roomName} - 게임 결과
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

export default HardcodedGameResultPage;