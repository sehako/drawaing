import React, { useEffect, useState } from 'react';

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
  onPlayerRoleChange
}) => {
  // 각 플레이어 포지션별 ID를 저장하는 상태
  const [positionIds, setPositionIds] = useState<{[position: string]: number | null}>({
    "정답자": null,
    "순서1": null,
    "순서2": null,
    "순서3": null
  });

  console.log('PlayerSection에서 받은 paredUser:', paredUser);
  console.log('현재 사용자 ID:', paredUser?.id);
  console.log('현재 사용자 이름:', paredUser?.name);
  console.log('playerMessages:', playerMessages);

  // 기본 플레이어 데이터 추가
  const defaultPlayers: Player[] = [
    { id: 0, name: '플레이어1', level: 12, avatar: baby },
    { id: 1, name: '플레이어2', level: 50, avatar: max },
    { id: 2, name: '플레이어3', level: 25, avatar: angry },
    { id: 3, name: '플레이어4', level: 16, avatar: chicken }
  ];

  // storedPlayersList 체크 및 활성화 로그
  console.log('storedPlayersList 원본:', storedPlayersList);

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

  // 라운드별 플레이어 배치 정의 생성 함수 (수정)
  const generateRoundPositions = (): RoundPositions => {
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
  };

  // 라운드별 플레이어 배치
  const roundPositions = generateRoundPositions();

  // 현재 라운드에 맞는 플레이어 배치 가져오기
  const getCurrentPositions = (): PositionMap => {
    // 라운드가 4보다 크면 반복되도록 계산
    const normalizedRound = ((currentRound - 1) % 4) + 1;
    return roundPositions[normalizedRound] || roundPositions[1];
  };

  // 현재 라운드의 플레이어 배치
  const currentPositions = getCurrentPositions();

  // 각 포지션에 해당하는 플레이어 ID 업데이트
  useEffect(() => {
    const updatedPositionIds: {[position: string]: number | null} = {
      "정답자": null,
      "순서1": null,
      "순서2": null,
      "순서3": null
    };

    // 각 포지션에 해당하는 플레이어 ID 찾기
    for (const position in currentPositions) {
      const playerName = currentPositions[position as keyof PositionMap];
      const player = playerArray.find(p => p.name === playerName);
      if (player) {
        updatedPositionIds[position] = player.id;
      }
    }

    setPositionIds(updatedPositionIds);
    console.log('포지션별 ID 업데이트:', updatedPositionIds);
  }, [currentPositions, playerArray]);

  console.log('현재 포지션 배치:', currentPositions);
  console.log('포지션별 ID:', positionIds);

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

  // 포지션에 해당하는 플레이어 정보 가져오기 (수정)
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

  // 현재 플레이어가 맡고 있는 역할 찾기
  const getCurrentPlayerRole = (): PlayerRole | null => {
    if (!paredUser) return null;

    // 현재 포지션 배치에서 현재 플레이어 찾기
    for (const [role, playerName] of Object.entries(currentPositions)) {
      const player = playerArray.find(p => p.name === playerName);

      // paredUser와 일치하는 플레이어 찾기
      if (player && ((currentUserId && player.id.toString() === currentUserId) ||
        (paredUser.id && player.id === paredUser.id))) {
        return role as PlayerRole;
      }
    }
    return null;
  };

  // 추가: 역할에 따른 권한 계산
  const calculatePlayerPermissions = (role: PlayerRole | null): PlayerPermissions => {
    if (!role) return { canDraw: false, canGuess: false, canSeeWord: false, canAnswer: false };

    // 기본 권한 설정
    const permissions = {
      canDraw: false,
      canGuess: false,
      canSeeWord: false,
      canAnswer: false
    };

    // 현재 턴에 그림을 그릴 수 있는 사람 설정
    if ((activeDrawerIndex === 0 && role === "순서1") ||
      (activeDrawerIndex === 1 && role === "순서2") ||
      (activeDrawerIndex === 2 && role === "순서3")) {
      permissions.canDraw = true;
    }

    // 제시어를 볼 수 있는 사람 설정
    if (role === "순서1" ||
      (activeDrawerIndex >= 1 && role === "순서2") ||
      (activeDrawerIndex >= 2 && role === "순서3")) {
      permissions.canSeeWord = true;
    }

    // 정답을 맞출 수 있는 사람 설정 (canGuess와 canAnswer 모두 설정)
    if (role === "정답자") {
      // 정답자는 항상 정답 맞추기 가능
      permissions.canGuess = true;
      permissions.canAnswer = true;
    } else if (role === "순서2" && activeDrawerIndex === 0) {
      // 첫번째 턴에서 두번째 순서 사람은 정답 맞추기 가능
      permissions.canGuess = true;
      permissions.canAnswer = true;
    } else if (role === "순서3" && (activeDrawerIndex === 0 || activeDrawerIndex === 1)) {
      // 첫번째, 두번째 턴에서 세번째 순서 사람은 정답 맞추기 가능
      permissions.canGuess = true;
      permissions.canAnswer = true;
    }

    return permissions;
  };

  // 역할 및 권한 변경시 부모 컴포넌트에 전달
  useEffect(() => {
    const currentRole = getCurrentPlayerRole();
    const permissions = calculatePlayerPermissions(currentRole);

    if (onPlayerRoleChange) {
      onPlayerRoleChange({
        role: currentRole,
        isCurrentPlayer: !!currentRole,
        currentPositions,
        playerPermissions: permissions
      });
    }

    // 디버깅용 로그
    console.log('현재 플레이어 역할:', currentRole);
    console.log('현재 포지션 배치:', currentPositions);
    console.log('현재 플레이어 권한:', permissions);
  }, [currentRound, activeDrawerIndex, paredUser]);

  // ID로 플레이어 메시지 찾기
  const getPlayerMessageById = (playerId: number | null): string | undefined => {
    if (playerId === null) return undefined;
    
    console.log(`ID ${playerId}의 메시지 찾는 중...`, playerMessages);
    
    // ID 값으로 메시지 찾기 (숫자형)
    if (playerMessages[playerId] !== undefined) {
      console.log(`ID ${playerId}(숫자형)로 메시지 찾음:`, playerMessages[playerId]);
      return playerMessages[playerId];
    }
    
    // ID 값으로 메시지 찾기 (문자열형)
    if (playerMessages[playerId.toString()] !== undefined) {
      console.log(`ID ${playerId}(문자열형)로 메시지 찾음:`, playerMessages[playerId.toString()]);
      return playerMessages[playerId.toString()];
    }
    
    console.log(`ID ${playerId}의 메시지를 찾지 못함`);
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

    console.log(`포지션 ${position}, 플레이어 ID: ${positionId}, 메시지: ${playerMessage}`);
    console.log('----------------------------------------');
    console.log(`포지션: ${position}`);
    console.log(`플레이어: ${player.name} (ID: ${player.id})`);
    console.log(`포지션 ID: ${positionId}`);
    console.log(`모든 메시지 키:`, Object.keys(playerMessages));
    console.log(`찾은 메시지: "${playerMessage}"`);
    console.log(`메시지 데이터 타입: ${typeof playerMessage}`);
    console.log(`메시지가 있나요? ${!!playerMessage}`);
    console.log('----------------------------------------');

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