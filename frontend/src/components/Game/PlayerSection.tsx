import React, { useEffect, useState, useCallback } from 'react';

// 기존 이미지 import
import baby from '../../assets/Game/baby.png';
import angry from '../../assets/Game/angry.png';
import chicken from '../../assets/Game/chicken.png';
import kid from '../../assets/Game/kid.png';
import max from '../../assets/Game/max.png';

// 플레이어 접속 상태 맵 타입 정의
interface PlayerConnectionMap {
  [name: string]: boolean;
}
export interface PlayerPermissions {
  canDraw: boolean;    // 그림 그리기 권한
  canGuess: boolean;   // 정답 입력 권한 
  canSeeWord: boolean; // 제시어 확인 권한
  canAnswer: boolean;
}

export type PlayerRole = "정답자" | "순서1" | "순서2" | "순서3";

interface PlayerSectionProps {
  currentRound: number;
  activeDrawerIndex: number;
  guesserIndex: number;
  roomId?: string;
  playerConnections: any;
  isConnected: boolean;
  playerMessages: { [key: number | string]: string }; // ID를 키로 가지는 메시지 맵
  storedPlayersList: Array<{ id: number; name: string; level: number; avatar: string }>;
  paredUser?: any; // 새로운 props 추가
  onPlayerRoleChange?: (roleInfo: {
    role: PlayerRole | null;
    isCurrentPlayer: boolean;
    currentPositions: PositionMap;
    playerPermissions: PlayerPermissions;
  }) => void;
  onActivePlayerChange?: (activePlayerId: number) => void; // 추가: 활성 플레이어 변경 콜백
}

interface Player {
  id: number;
  name: string;
  level: number;
  avatar: string;
}

// 플레이어 정보 인터페이스
interface PlayerInfo {
  level: number;
  avatar: string;
}

// 플레이어 목록 타입
type PlayerList = {
  [name: string]: PlayerInfo;
}

// 포지션별 배치 타입
export interface PositionMap {
  "정답자": string;
  "순서1": string;
  "순서2": string;
  "순서3": string;
}

// 라운드별 배치 타입
type RoundPositions = {
  [round: number]: PositionMap;
}

// 포지션 데이터 타입 정의
interface PositionData {
  label: string;
  borderColor: string;
  bgColor: string;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
  currentRound = 1,
  activeDrawerIndex = 0,
  guesserIndex = 0,
  isConnected = false,
  playerConnections = {},
  playerMessages = {},
  storedPlayersList = [], // 기본값 빈 배열 제공
  paredUser,
  onPlayerRoleChange,
  onActivePlayerChange 
}) => {
  // 각 플레이어 포지션별 ID를 저장하는 상태
  const [positionIds, setPositionIds] = useState<{[position: string]: number | null}>({
    "정답자": null,
    "순서1": null,
    "순서2": null,
    "순서3": null
  });

  // 기본 플레이어 데이터 추가
  const defaultPlayers: Player[] = [
    { id: 0, name: '플레이어1', level: 12, avatar: baby },
    { id: 1, name: '플레이어2', level: 50, avatar: max },
    { id: 2, name: '플레이어3', level: 25, avatar: angry },
    { id: 3, name: '플레이어4', level: 16, avatar: chicken }
  ];

  // 플레이어 배열을 확실하게 가져오기
  const playerArray: Player[] = (Array.isArray(storedPlayersList) && storedPlayersList.length > 0)
    ? storedPlayersList.map(player => ({
      id: player.id,
      name: player.name,
      level: player.level || 1,
      avatar: player.avatar || 'default_character'
    }))
    : defaultPlayers;

  // 현재 사용자 ID (paredUser의 id 값)
  const currentUserId = paredUser?.id?.toString();

  // 라운드별 플레이어 배치 정의 생성 함수를 useCallback으로 메모이제이션
  const generateRoundPositions = useCallback((): RoundPositions => {
    const rounds: RoundPositions = {};

    // 플레이어 배열이 비어있으면 빈 객체 반환
    if (!playerArray || playerArray.length === 0) {
      return rounds;
    }

    // 실제 플레이어 이름 사용
    const playerCount = playerArray.length;

    // 4라운드 각각에 대해 포지션 계산
    for (let round = 1; round <= 4; round++) {
      rounds[round] = {
        "정답자": playerArray[(round - 1) % playerCount]?.name || `플레이어${((round - 1) % playerCount) + 1}`,
        "순서1": playerArray[round % playerCount]?.name || `플레이어${(round % playerCount) + 1}`,
        "순서2": playerArray[(round + 1) % playerCount]?.name || `플레이어${((round + 1) % playerCount) + 1}`,
        "순서3": playerArray[(round + 2) % playerCount]?.name || `플레이어${((round + 2) % playerCount) + 1}`
      };
    }

    return rounds;
  }, [playerArray]); // playerArray만 의존성으로 추가

  // 라운드별 플레이어 배치를 useEffect 외부에서 한 번만 계산
  const roundPositions = React.useMemo(() => generateRoundPositions(), [generateRoundPositions]);

  // 현재 라운드의 플레이어 배치를 직접 계산 - 불필요한 함수 호출 제거
  const normalizedRound = ((currentRound - 1) % 4) + 1;
  const currentPositions = roundPositions[normalizedRound] || roundPositions[1];

  // 각 포지션에 해당하는 플레이어 ID 업데이트
  

  // 문자열로 된 avatar가 들어왔을 때 실제 이미지로 변환
  const getAvatarImage = (avatarStr: string | undefined): string => {
    if (!avatarStr) {
      return baby; // undefined인 경우 기본 이미지 반환
    }

    if (avatarStr === 'default_character') {
      return baby; // 기본 캐릭터 이미지 사용
    } else if (typeof avatarStr === 'string' && avatarStr.startsWith('http')) {
      return avatarStr; // URL인 경우 그대로 사용
    } else {
      // 다른 문자열 식별자에 따라 분기 처리 가능
      switch (avatarStr) {
        case 'angry': return angry;
        case 'chicken': return chicken;
        case 'kid': return kid;
        case 'max': return max;
        default: return baby;
      }
    }
  };

  // 포지션에 해당하는 플레이어 정보 가져오기 (메모이제이션 대신 일반 함수로 변경)
  const getPlayerByPosition = (position: keyof PositionMap): Player => {
    const playerName = currentPositions[position];

    // 이름으로 playerArray에서 찾기
    const player = playerArray.find(p => p.name === playerName);
    if (player) {
      return player;
    }

    // 찾지 못한 경우 첫 번째 기본 플레이어 반환
    return defaultPlayers[0];
  };

  // 플레이어 이름 표시 (현재 사용자인 경우 "(나)" 추가)
  const getDisplayName = (player: Player): string => {
    if (!player) return "";

    // 플레이어 ID와 현재 사용자 ID 비교
    if ((currentUserId !== undefined && player.id.toString() === currentUserId) ||
      (paredUser?.id && player.id === paredUser.id)) {
      return `${player.name} (나)`;
    }

    return player.name;
  };

  // 해당 함수들은 useEffect 내부로 이동하여 무한 루프 방지
  // useEffect 내부에서 직접 계산하도록 변경했습니다.

  // 역할 및 권한 변경시 부모 컴포넌트에 전달 - useRef로 최적화
  const lastRoleInfoRef = React.useRef<any>(null);
  useEffect(() => {
    // 의존성 배열에 문제가 있으므로 ref로 최적화합니다
    const updatedPositionIds: {[position: string]: number | null} = {
      "정답자": null,
      "순서1": null,
      "순서2": null,
      "순서3": null
    };
  
    // 현재 라운드에 맞는 포지션 직접 계산 (의존성 줄이기)
    const normalizedRound = ((currentRound - 1) % 4) + 1;
    const positions = roundPositions[normalizedRound] || roundPositions[1];
  
    // 각 포지션에 해당하는 플레이어 ID 찾기
    for (const position in positions) {
      const playerName = positions[position as keyof PositionMap];
      const player = playerArray.find(p => p.name === playerName);
      if (player) {
        updatedPositionIds[position] = player.id;
      }
    }
  
    // JSON 문자열 비교로 깊은 비교 구현
    const currentStr = JSON.stringify(positionIds);
    const updatedStr = JSON.stringify(updatedPositionIds);
    
    if (currentStr !== updatedStr) {
      setPositionIds(updatedPositionIds);
    }
  
    // 현재 활성 드로어 인덱스에 해당하는 플레이어 찾기
    if (activeDrawerIndex >= 0 && activeDrawerIndex < 3) {
      const position = `순서${activeDrawerIndex + 1}` as keyof PositionMap;
      const playerName = currentPositions[position];
      const activePlayer = playerArray.find(p => p.name === playerName);
      
      if (activePlayer && onActivePlayerChange) {
        console.log(`활성 플레이어 변경 감지: ${activePlayer.name} (ID: ${activePlayer.id})`);
        onActivePlayerChange(activePlayer.id);
      }
    }
  }, [currentRound, roundPositions, playerArray, activeDrawerIndex, currentPositions, onActivePlayerChange]);
  useEffect(() => {
    // 포지션에서 현재 사용자의 역할 직접 찾기
    let currentRole: PlayerRole | null = null;
    
    if (paredUser) {
      for (const [role, playerName] of Object.entries(currentPositions)) {
        const player = playerArray.find(p => p.name === playerName);
        if (player && ((currentUserId && player.id.toString() === currentUserId) ||
          (paredUser.id && player.id === paredUser.id))) {
          currentRole = role as PlayerRole;
          break;
        }
      }
    }
    
    // 권한 직접 계산
    const permissions = {
      canDraw: false,
      canGuess: false,
      canSeeWord: false,
      canAnswer: false
    };
    
    if (currentRole) {
      // 그림 그리기 권한
      if ((activeDrawerIndex === 0 && currentRole === "순서1") ||
          (activeDrawerIndex === 1 && currentRole === "순서2") ||
          (activeDrawerIndex === 2 && currentRole === "순서3")) {
        permissions.canDraw = true;
      }
      
      // 제시어 보기 권한
      if (currentRole === "순서1" ||
          (activeDrawerIndex >= 1 && currentRole === "순서2") ||
          (activeDrawerIndex >= 2 && currentRole === "순서3")) {
        permissions.canSeeWord = true;
      }
      
      // 정답 맞추기 권한
      if (currentRole === "정답자") {
        permissions.canGuess = true;
        permissions.canAnswer = true;
      } else if (currentRole === "순서2" && activeDrawerIndex === 0) {
        permissions.canGuess = true;
        permissions.canAnswer = true;
      } else if (currentRole === "순서3" && (activeDrawerIndex === 0 || activeDrawerIndex === 1)) {
        permissions.canGuess = true;
        permissions.canAnswer = true;
      }
    }
    
    const roleInfo = {
      role: currentRole,
      isCurrentPlayer: !!currentRole,
      currentPositions,
      playerPermissions: permissions
    };
    
    // 이전 정보와 비교하여 변경된 경우에만 콜백 호출
    const roleInfoStr = JSON.stringify(roleInfo);
    const lastRoleInfoStr = lastRoleInfoRef.current ? JSON.stringify(lastRoleInfoRef.current) : '';
    
    if (roleInfoStr !== lastRoleInfoStr && onPlayerRoleChange) {
      lastRoleInfoRef.current = roleInfo;
      onPlayerRoleChange(roleInfo);
    }
  }, [currentRound, activeDrawerIndex, paredUser, playerArray, currentPositions, currentUserId, onPlayerRoleChange]);

  // ID로 플레이어 메시지 찾기
  const getPlayerMessageById = (playerId: number | null): string | undefined => {
    if (playerId === null) return undefined;
    
    // ID 값으로 메시지 찾기 (숫자형)
    if (playerMessages[playerId] !== undefined) {
      return playerMessages[playerId];
    }
    
    // ID 값으로 메시지 찾기 (문자열형)
    if (playerMessages[playerId.toString()] !== undefined) {
      return playerMessages[playerId.toString()];
    }
    
    return undefined;
  };

  // 포지션 데이터 정의
  const positionData: Record<string, PositionData> = {
    "정답자": { label: "정답자", borderColor: "border-purple-600", bgColor: "bg-purple-600" },
    "순서1": { label: "순서1", borderColor: "border-green-600", bgColor: "bg-green-600" },
    "순서2": { label: "순서2", borderColor: "border-green-600", bgColor: "bg-green-600" },
    "순서3": { label: "순서3", borderColor: "border-green-600", bgColor: "bg-green-600" }
  };

  // 플레이어 카드 렌더링 함수
  const renderPlayerCard = (position: keyof PositionMap, isActive: boolean = false, isLast: boolean = false) => {
    const player = getPlayerByPosition(position);
    const positionStyle = positionData[position];
    const isCurrentUser = (currentUserId !== undefined && player?.id?.toString() === currentUserId) ||
      (paredUser?.name && player?.name === paredUser.name);

    // 포지션별 ID로 메시지 찾기
    const positionId = positionIds[position];
    const playerMessage = getPlayerMessageById(positionId);

    return (
        <div
        className={`relative h-[130px] flex border-4 p-2 rounded-lg ${!isLast ? 'mb-3' : ''} ml-1
            ${isCurrentUser ? 'bg-[#e8bcc7]' : 'bg-[#FDE047]'}
            ${isActive
            ? 'border-green-600 ring-2 ring-green-600'
            : position === "정답자"
                ? 'border-purple-600'
                : 'border-gray-300'
            }`}
        >
        <div className={`absolute -top-2 -left-2 ${positionStyle.bgColor} text-white px-2 py-1 text-xs font-bold rounded-md shadow`}>
          {positionStyle.label}
        </div>

        {/* 말풍선 - 컨테이너 왼쪽에 고정 */}
        {playerMessage && (
        <div className="absolute w-[120px] left-[-140px] top-[60px] z-50">
            <div className="bg-red-400 p-2 rounded-lg shadow-lg border-2 border-red-600 relative">
            <p className="text-sm text-white font-bold break-words">{playerMessage}</p>
            {/* 말풍선 화살표 */}
            <div className="absolute top-1/2 right-[-10px] transform -translate-y-1/2">
                <div className="w-0 h-0 
                            border-t-[8px] border-t-transparent 
                            border-l-[10px] border-l-red-600 
                            border-b-[8px] border-b-transparent"></div>
            </div>
            </div>
        </div>
        )}

        <div className="w-[55%] h-full flex items-center justify-center">
          <img
            src={getAvatarImage(player?.avatar)}
            alt={player?.name || "플레이어"}
            className="object-contain h-full w-full"
          />
        </div>
        <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
          <div className="text-gray-800 font-bold text-base mt-3">
          Lv.{player?.level || 1} :{getDisplayName(player)}
          </div>
          {/* ID 표시 */}
          <div className="text-xs text-gray-500 mb-1">
            ID: {player.id}
          </div>
          
        </div>

        {/* 오른쪽 말풍선 형태로 표시 (고정 크기) */}
        {process.env.NODE_ENV === 'development' && playerMessage && (
          <div className="absolute bottom-[20px] right-[10px] w-[120px] z-10">
            <div className="relative bg-yellow-100 p-2 rounded-lg shadow-md border border-gray-300 w-full min-h-[60px] flex items-center justify-center">
              <p className="text-xm text-black break-words overflow-hidden text-center">{playerMessage}</p>
              {/* 말풍선 화살표 (왼쪽 방향) */}
              <div className="absolute top-1/2 left-[-8px] transform -translate-y-1/2">
                <div className="w-0 h-0 
                              border-t-[6px] border-t-transparent 
                              border-r-[8px] border-r-gray-300 
                              border-b-[6px] border-b-transparent"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-[250px] flex flex-col overflow-hidden">
      {/* 디버그 정보 표시 */}
      <div className="hidden">
        <p>현재 플레이어 ID: {currentUserId}</p>
        <p>현재 플레이어 이름: {paredUser?.name}</p>
        <p>현재 라운드: {currentRound}</p>
        <p>현재 라운드 포지션:</p>
        <pre>{JSON.stringify(currentPositions, null, 2)}</pre>
        <p>전체 메시지:</p>
        <pre>{JSON.stringify(playerMessages, null, 2)}</pre>
      </div>

      {/* 모든 메시지 디버깅용 표시 */}
      <div className="hidden bg-gray-100 p-2 mb-2 rounded-md text-xs">
        <p className="font-bold">모든 playerMessages:</p>
        <ul>
          {Object.entries(playerMessages).map(([key, value]) => (
            <li key={key}>ID {key}: {value}</li>
          ))}
        </ul>
      </div>

      {/* 플레이어 카드 동적 렌더링 */}
      {renderPlayerCard("정답자")}
      {renderPlayerCard("순서1", activeDrawerIndex === 0)}
      {renderPlayerCard("순서2", activeDrawerIndex === 1)}
      {renderPlayerCard("순서3", activeDrawerIndex === 2, true)}
    </div>
  );
}

export default PlayerSection;