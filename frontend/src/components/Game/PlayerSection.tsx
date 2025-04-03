import React, { useEffect, useState } from 'react';

// 기존 이미지 import
import baby from '../../assets/Game/baby.png';
import angry from '../../assets/Game/angry.png';
import chicken from '../../assets/Game/chicken.png';
import kid from '../../assets/Game/kid.png';
import max from '../../assets/Game/max.png';
import { Player } from '../../utils/GameSocketUtils'; // Player 인터페이스 가져오기 (경로는 실제 프로젝트에 맞게 조정)

// 플레이어 접속 상태 맵 타입 정의
interface PlayerConnectionMap {
  [key: string]: boolean;
}

interface PlayerSectionProps {
  currentRound?: number;
  activeDrawerIndex?: number;
  guesserIndex?: number;
  roomId?: string;
  isConnected?: boolean;
  playerConnections?: any;
  playerMessages?: {[userId: number]: string};
}

// 플레이어 정보 인터페이스
interface PlayerInfo {
  level: number;
  avatar: string;
  nickname: string;
  isReady: boolean;
  isHost: boolean;
  characterUrl?: string;
}

interface SpeechBubble {
  userId: number;
  message: string;
  timestamp: number; // 메시지 표시 시간 추적을 위한 타임스탬프
}

// 포지션별 배치 타입
interface PositionMap {
  "정답자": string;
  "순서1": string;
  "순서2": string;
  "순서3": string;
}

// 라운드별 배치 타입
type RoundPositions = {
  [round: number]: PositionMap;
}

// 기본 아바타 이미지 매핑
const defaultAvatars: {[key: string]: string} = {
  '1': baby,
  '2': max,
  '3': angry,
  '4': chicken,
  'default': kid
};

const PlayerSection: React.FC<PlayerSectionProps> = ({ 
  currentRound = 1, 
  activeDrawerIndex = 0, 
  guesserIndex = 0, 
  roomId = "67e3b8c70e25f60ac596bd83", 
  isConnected = false,
  playerConnections = {},
  playerMessages = {}
}) => {
  const currentPlayerNumber = localStorage.getItem('playerNumber') || '1';
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 로컬 스토리지에서 플레이어 목록 로드
  useEffect(() => {
    const loadPlayersFromStorage = () => {
      try {
        // 로컬 스토리지에서 플레이어 목록 가져오기
        const storedPlayers = localStorage.getItem('playersList');
        
        if (storedPlayers) {
          const storedPlayersList = JSON.parse(storedPlayers) as Player[];
          console.log('로컬 스토리지에서 플레이어 목록 로드:', storedPlayersList);
          
          // 플레이어 목록을 PlayerInfo 형식으로 변환
          const playerInfoList: PlayerInfo[] = storedPlayersList.map((player, index) => ({
            level: Math.floor(Math.random() * 50) + 1, // 임시로 랜덤 레벨 설정
            avatar: getAvatarByPlayerNumber(index + 1), // 플레이어 번호로 아바타 설정
            nickname: player.nickname,
            isReady: player.isReady,
            isHost: player.isHost,
            characterUrl: player.characterUrl
          }));
          
          setPlayers(playerInfoList);
        } else {
          console.warn('로컬 스토리지에 저장된 플레이어 목록이 없습니다. 기본값을 사용합니다.');
          // 기본 플레이어 목록 설정
          setPlayers([
            { level: 12, avatar: baby, nickname: "플레이어1", isReady: true, isHost: true },
            { level: 50, avatar: max, nickname: "플레이어2", isReady: false, isHost: false },
            { level: 25, avatar: angry, nickname: "플레이어3", isReady: false, isHost: false },
            { level: 16, avatar: chicken, nickname: "플레이어4", isReady: false, isHost: false }
          ]);
        }
      } catch (error) {
        console.error('플레이어 목록 로드 중 오류:', error);
        // 오류 시 기본값 사용
        setPlayers([
          { level: 12, avatar: baby, nickname: "플레이어1", isReady: true, isHost: true },
          { level: 50, avatar: max, nickname: "플레이어2", isReady: false, isHost: false },
          { level: 25, avatar: angry, nickname: "플레이어3", isReady: false, isHost: false },
          { level: 16, avatar: chicken, nickname: "플레이어4", isReady: false, isHost: false }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayersFromStorage();
  }, []);
  
  // 플레이어 번호에 따른 아바타 이미지 가져오기
  const getAvatarByPlayerNumber = (playerNumber: number): string => {
    const key = playerNumber.toString();
    return defaultAvatars[key] || defaultAvatars['default'];
  };
  
  // 플레이어 순환 로직으로 roundPositions 생성
  const generateRoundPositions = (): RoundPositions => {
    const positions: RoundPositions = {};
    const playerCount = players.length || 4;
    
    // 플레이어 배열 생성
    const playerNicknames = players.length > 0 
      ? players.map(player => player.nickname)
      : Array.from({ length: playerCount }, (_, i) => `플레이어${i + 1}`);
    
    // 각 라운드별 포지션 설정
    for (let round = 1; round <= playerCount; round++) {
      const roundPosition: PositionMap = {
        "정답자": playerNicknames[(round - 1) % playerCount],
        "순서1": playerNicknames[round % playerCount],
        "순서2": playerNicknames[(round + 1) % playerCount],
        "순서3": playerNicknames[(round + 2) % playerCount]
      };
      positions[round] = roundPosition;
    }
    
    return positions;
  };

  // 동적으로 roundPositions 생성
  const roundPositions: RoundPositions = generateRoundPositions();
  
  // 현재 라운드에 맞는 플레이어 배치 가져오기
  const getCurrentPositions = (): PositionMap => {
    // 라운드가 플레이어 수보다 크면 반복되도록 계산
    const playerCount = players.length || 4;
    const normalizedRound = ((currentRound - 1) % playerCount) + 1;
    return roundPositions[normalizedRound] || roundPositions[1];
  };
  
  // 현재 라운드의 플레이어 배치
  const currentPositions = getCurrentPositions();
  
  // 플레이어 위치에 해당하는 플레이어 번호 찾기
  const getPlayerNumberByPosition = (position: keyof PositionMap): number => {
    const playerName = currentPositions[position];
    const playerIndex = players.findIndex(p => p.nickname === playerName);
    return playerIndex !== -1 ? playerIndex + 1 : 1; // 플레이어 번호는 1부터 시작, 없으면 1 반환
  };

  // 플레이어 이름에 해당하는 플레이어 정보 가져오기
  const getPlayerInfo = (name: string): PlayerInfo => {
    const playerInfo = players.find(p => p.nickname === name);
    if (playerInfo) {
      return playerInfo;
    }
    // 기본값 반환 (에러 방지)
    return { 
      level: 0, 
      avatar: baby, 
      nickname: name, 
      isReady: false, 
      isHost: false 
    };
  };

  // 플레이어 접속 상태 가져오기
  const getPlayerConnectionStatus = (playerName: string): boolean => {
    // 로컬스토리지에서 가져온 플레이어 번호 기준으로 체크
    const playerIndex = players.findIndex(p => p.nickname === playerName);
    const playerNumber = (playerIndex + 1).toString();
    
    // 플레이어 접속 상태가 명시적으로 false로 설정되지 않은 한 true로 간주
    return playerConnections[playerNumber] ?? true;
  };

  // 접속 상태 텍스트 표시
  const getConnectionStatusText = (playerName: string): string => {
    return getPlayerConnectionStatus(playerName) ? '(접속중)' : '(접속하지 않음)';
  };

  const SpeechBubble = ({ message }: { message: string }) => {
    // 메시지가 너무 길면 자르기
    const truncateMessage = (text: string, maxLength: number = 20): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };
    
    return (
      <div className="absolute left-[-140px] top-1/2 transform -translate-y-1/2 w-[120px]">
        <div className="relative bg-yellow-100 p-2 rounded-lg shadow-sm border-2 border-yellow-300">
          <div className="text-sm break-words text-gray-800 font-medium">
            {truncateMessage(message)}
          </div>
          {/* 말풍선 화살표 */}
          <div className="absolute top-1/2 right-[-10px] transform -translate-y-1/2">
            <div className="w-0 h-0 
                        border-t-[8px] border-t-transparent 
                        border-l-[10px] border-l-yellow-300 
                        border-b-[8px] border-b-transparent"></div>
          </div>
        </div>
      </div>
    );
  };
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="h-[580px] w-[250px] flex flex-col items-center justify-center">
        <div className="text-lg font-bold">플레이어 정보 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-[580px] w-[250px] flex flex-col overflow-hidden">
      {/* 디버그 정보 표시 (개발 중에만 사용, 필요에 따라 주석 처리) */}
      <div className="text-xs bg-gray-100 p-2 mb-2 rounded-md overflow-auto" style={{ maxHeight: '150px' }}>
        <p>현재 플레이어 번호: {currentPlayerNumber}</p>
        <p>현재 라운드 포지션:</p>
        <pre className="text-[10px]">{JSON.stringify(currentPositions, null, 2)}</pre>
        <p>로드된 플레이어:</p>
        <pre className="text-[10px]">{JSON.stringify(players, null, 2)}</pre>
      </div>
      
      {/* 정답자 */}
      <div className="h-[135px] flex border-4 border-purple-600 p-2 rounded-lg bg-[#FDE047] relative mb-3 mt-1 ml-1">
        <div className="absolute -top-2 -left-2 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow">
          정답자
        </div>
        
        {/* 말풍선 추가 */}
        {playerMessages && playerMessages[getPlayerNumberByPosition("정답자")] && (
          <SpeechBubble message={playerMessages[getPlayerNumberByPosition("정답자")]} />
        )}
        
        {/* 현재 플레이어와 userId가 일치하는 메시지만 표시 */}
        {Object.entries(playerMessages)
          .filter(([userId]) => getPlayerNumberByPosition("정답자").toString() === userId)
          .map(([userId, message]) => (
            <div key={userId} className="absolute left-full ml-2 top-0 z-50 
                            bg-white border border-gray-200 
                            rounded-lg p-2 
                            max-w-[200px] max-h-[135px] 
                            overflow-auto">
              <p className="text-sm">{message}</p>
            </div>
          ))
        }
        
        <div className="w-[55%] h-full flex items-center justify-center">
          <img 
            src={getPlayerInfo(currentPositions["정답자"]).characterUrl || getPlayerInfo(currentPositions["정답자"]).avatar} 
            alt={currentPositions["정답자"]} 
            className="object-contain h-full w-full" 
            onError={(e) => {
              // 이미지 로드 실패 시 기본 아바타로 대체
              (e.target as HTMLImageElement).src = getPlayerInfo(currentPositions["정답자"]).avatar;
            }}
          />
        </div>
        <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
          <div className="text-gray-800 font-bold text-base mt-3">
            {currentPositions["정답자"]}
          </div>
          <div className="text-sm text-gray-600">Lv.{getPlayerInfo(currentPositions["정답자"]).level}</div>
          <div className={`text-xs font-medium ${getPlayerConnectionStatus(currentPositions["정답자"]) ? 'text-green-600' : 'text-red-600'}`}>
            {getConnectionStatusText(currentPositions["정답자"])}
          </div>
          <div className="flex justify-center w-full mt-1 mb-2">
            <button className="text-lg cursor-pointer bg-slate-100 mr-1">👍</button>
            <button className="text-lg cursor-pointer bg-slate-100 ml-1">👎</button>    
          </div>
        </div>
      </div>
      
      {/* 순서1 */}
      <div className={`h-[135px] flex border-4 p-2 rounded-lg bg-[#FDE047] relative mb-3 ml-1
          ${activeDrawerIndex === 0 
              ? 'border-green-600 ring-2 ring-green-600' 
              : 'border-gray-300'
          }`}>
        <div className="absolute -top-2 -left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow">
          순서1
        </div>
        
        {/* 말풍선 추가 */}
        {playerMessages && playerMessages[getPlayerNumberByPosition("순서1")] && (
          <SpeechBubble message={playerMessages[getPlayerNumberByPosition("순서1")]} />
        )}
        
        {/* 현재 플레이어와 userId가 일치하는 메시지만 표시 */}
        {Object.entries(playerMessages)
          .filter(([userId]) => getPlayerNumberByPosition("순서1").toString() === userId)
          .map(([userId, message]) => (
            <div key={userId} className="absolute left-full ml-2 top-0 z-50 
                            bg-white border border-gray-200 
                            rounded-lg p-2 
                            max-w-[200px] max-h-[135px] 
                            overflow-auto">
              <p className="text-sm">{message}</p>
            </div>
          ))
        }
        
        <div className="w-[55%] h-full flex items-center justify-center">
          <img 
            src={getPlayerInfo(currentPositions["순서1"]).characterUrl || getPlayerInfo(currentPositions["순서1"]).avatar} 
            alt={currentPositions["순서1"]} 
            className="object-contain h-full w-full" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlayerInfo(currentPositions["순서1"]).avatar;
            }}
          />
        </div>
        <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
          <div className="text-gray-800 font-bold text-base mt-3">
            {currentPositions["순서1"]}
          </div>
          <div className="text-sm text-gray-600">Lv.{getPlayerInfo(currentPositions["순서1"]).level}</div>
          <div className={`text-xs font-medium ${getPlayerConnectionStatus(currentPositions["순서1"]) ? 'text-green-600' : 'text-red-600'}`}>
            {getConnectionStatusText(currentPositions["순서1"])}
          </div>
          <div className="flex justify-center w-full mt-1 mb-2">
            <button className="text-lg cursor-pointer bg-slate-100 mr-1">👍</button>
            <button className="text-lg cursor-pointer bg-slate-100 ml-1">👎</button>
          </div>
        </div>
      </div>
      
      {/* 순서2 */}
      <div className={`h-[135px] flex border-4 p-2 rounded-lg bg-[#FDE047] relative mb-3 ml-1
          ${activeDrawerIndex === 1 
              ? 'border-green-600 ring-2 ring-green-600' 
              : 'border-gray-300'
          }`}>
        <div className="absolute -top-2 -left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow">
          순서2
        </div>
        
        {/* 말풍선 추가 */}
        {playerMessages && playerMessages[getPlayerNumberByPosition("순서2")] && (
          <SpeechBubble message={playerMessages[getPlayerNumberByPosition("순서2")]} />
        )}
        
        {/* 현재 플레이어와 userId가 일치하는 메시지만 표시 */}
        {Object.entries(playerMessages)
          .filter(([userId]) => getPlayerNumberByPosition("순서2").toString() === userId)
          .map(([userId, message]) => (
            <div key={userId} className="absolute left-full ml-2 top-0 z-50 
                            bg-white border border-gray-200 
                            rounded-lg p-2 
                            max-w-[200px] max-h-[135px] 
                            overflow-auto">
              <p className="text-sm">{message}</p>
            </div>
          ))
        }
        
        <div className="w-[55%] h-full flex items-center justify-center">
          <img 
            src={getPlayerInfo(currentPositions["순서2"]).characterUrl || getPlayerInfo(currentPositions["순서2"]).avatar} 
            alt={currentPositions["순서2"]} 
            className="object-contain h-full w-full" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlayerInfo(currentPositions["순서2"]).avatar;
            }}
          />
        </div>
        <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
          <div className="text-gray-800 font-bold text-base mt-3">
            {currentPositions["순서2"]}
          </div>
          <div className="text-sm text-gray-600">Lv.{getPlayerInfo(currentPositions["순서2"]).level}</div>
          <div className={`text-xs font-medium ${getPlayerConnectionStatus(currentPositions["순서2"]) ? 'text-green-600' : 'text-red-600'}`}>
            {getConnectionStatusText(currentPositions["순서2"])}
          </div>
          <div className="flex justify-center w-full mt-1 mb-2">
            <button className="text-lg cursor-pointer bg-slate-100 mr-1">👍</button>
            <button className="text-lg cursor-pointer bg-slate-100 ml-1">👎</button>
          </div>
        </div>
      </div>
      
      {/* 순서3 */}
      <div className={`h-[135px] flex border-4 p-2 rounded-lg bg-[#FDE047] relative ml-1
          ${activeDrawerIndex === 2 
              ? 'border-green-600 ring-2 ring-green-600' 
              : 'border-gray-300'
          }`}>
        <div className="absolute -top-2 -left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow">
          순서3
        </div>
        
        {/* 말풍선 추가 */}
        {playerMessages && playerMessages[getPlayerNumberByPosition("순서3")] && (
          <SpeechBubble message={playerMessages[getPlayerNumberByPosition("순서3")]} />
        )}
        
        {/* 현재 플레이어와 userId가 일치하는 메시지만 표시 */}
        {Object.entries(playerMessages)
          .filter(([userId]) => getPlayerNumberByPosition("순서3").toString() === userId)
          .map(([userId, message]) => (
            <div key={userId} className="absolute left-full ml-2 top-0 z-50 
                            bg-white border border-gray-200 
                            rounded-lg p-2 
                            max-w-[200px] max-h-[135px] 
                            overflow-auto">
              <p className="text-sm">{message}</p>
            </div>
          ))
        }
        
        <div className="w-[55%] h-full flex items-center justify-center">
          <img 
            src={getPlayerInfo(currentPositions["순서3"]).characterUrl || getPlayerInfo(currentPositions["순서3"]).avatar} 
            alt={currentPositions["순서3"]} 
            className="object-contain h-full w-full" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlayerInfo(currentPositions["순서3"]).avatar;
            }}
          />
        </div>
        <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
          <div className="text-gray-800 font-bold text-base mt-3">
            {currentPositions["순서3"]}
          </div>
          <div className="text-sm text-gray-600">Lv.{getPlayerInfo(currentPositions["순서3"]).level}</div>
          <div className={`text-xs font-medium ${getPlayerConnectionStatus(currentPositions["순서3"]) ? 'text-green-600' : 'text-red-600'}`}>
            {getConnectionStatusText(currentPositions["순서3"])}
          </div>
          <div className="flex justify-center w-full mt-1 mb-2">
            <button className="text-lg cursor-pointer bg-slate-100 mr-1">👍</button>
            <button className="text-lg cursor-pointer bg-slate-100 ml-1">👎</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSection;