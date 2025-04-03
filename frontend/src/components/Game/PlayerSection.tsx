import React from 'react';

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

interface PlayerSectionProps {
    currentRound: number;
    activeDrawerIndex: number;
    guesserIndex: number;
    roomId?: string;
    playerConnections: any;
    isConnected: boolean;
    playerMessages: { [key: string]: string };
    storedPlayersList: Array<{ id: number; name: string; level: number; avatar: string }>;
    paredUser?: any; // 새로운 props 추가
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

interface SpeechBubble {
    userId: number;
    message: string;
    timestamp: number; // 메시지 표시 시간 추적을 위한 타임스탬프
}

// 플레이어 목록 타입
type PlayerList = {
  [name: string]: PlayerInfo;
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
    paredUser
}) => {
    console.log('PlayerSection에서 받은 paredUser:', paredUser);
    console.log('현재 사용자 ID:', paredUser?.id);
    console.log('현재 사용자 이름:', paredUser?.name);
    
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
    
    // 라운드별 플레이어 배치 정의 생성 함수
    const generateRoundPositions = (): RoundPositions => {
        const rounds: RoundPositions = {};
        const playerCount = playerArray.length;
        
        // 4라운드 각각에 대해 포지션 계산
        for (let round = 1; round <= 4; round++) {
            rounds[round] = {
                "정답자": `플레이어${((round - 1) % playerCount) + 1}`,
                "순서1": `플레이어${((round) % playerCount) + 1}`,
                "순서2": `플레이어${((round + 1) % playerCount) + 1}`,
                "순서3": `플레이어${((round + 2) % playerCount) + 1}`
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
    
    console.log('현재 포지션 배치:', currentPositions);
    
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

    // 포지션 이름으로부터 해당 플레이어의 인덱스 찾기
    const getPlayerIndexFromPosition = (position: keyof PositionMap): number => {
        const playerName = currentPositions[position];
        if (!playerName) return 0;
        
        // "플레이어1"에서 숫자 부분만 추출하여 0-기반 인덱스로 변환
        const playerNumber = parseInt(playerName.replace('플레이어', ''), 10);
        return playerNumber - 1; // 1-기반 번호를 0-기반 인덱스로 변환
    };
    
    // 포지션에 해당하는 플레이어 정보 가져오기
    const getPlayerByPosition = (position: keyof PositionMap): Player => {
        const index = getPlayerIndexFromPosition(position);
        return playerArray[index] || defaultPlayers[index];
    };
    
    // 플레이어 이름 표시 (현재 사용자인 경우 "(나)" 추가)
    const getDisplayName = (player: Player): string => {
        if (!player) return "";
        
        // 플레이어 ID와 현재 사용자 ID 비교 또는 이름 비교
        if ((currentUserId !== undefined && player.id.toString() === currentUserId) || 
            (paredUser?.name && player.name === paredUser.name)) {
            return `${player.name} (나)`;
        }
        
        return player.name;
    };

    // 플레이어 접속 상태 가져오기
    const getPlayerConnectionStatus = (playerName: string): boolean => {
        // 플레이어 접속 상태가 명시적으로 false로 설정되지 않은 한 true로 간주
        return playerConnections[playerName] ?? true;
    };

    // 접속 상태 텍스트 표시
    const getConnectionStatusText = (playerName: string): string => {
        return getPlayerConnectionStatus(playerName) ? '(접속중)' : '(접속하지 않음)';
    };

    // 말풍선 컴포넌트
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
        
        return (
            <div 
                className={`h-[135px] flex border-4 p-2 rounded-lg relative ${!isLast ? 'mb-3' : ''} ml-1
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
                
                {/* 말풍선 추가 */}
                {playerMessages && playerMessages[player?.id?.toString() || ""] && (
                    <SpeechBubble message={playerMessages[player?.id?.toString() || ""]} />
                )}
                
                {/* 현재 플레이어와 userId가 일치하는 메시지만 표시 */}
                {Object.entries(playerMessages)
                    .filter(([userId]) => player?.id?.toString() === userId)
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
                        src={getAvatarImage(player?.avatar)} 
                        alt={player?.name || "플레이어"} 
                        className="object-contain h-full w-full" 
                    />
                </div>
                <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
                    <div className="text-gray-800 font-bold text-base mt-3">
                        {getDisplayName(player)}
                    </div>
                    <div className="text-sm text-gray-600">
                        Lv.{player?.level || 1}
                    </div>
                    <div className={`text-xs font-medium ${getPlayerConnectionStatus(currentPositions[position]) ? 'text-green-600' : 'text-red-600'}`}>
                        {getConnectionStatusText(currentPositions[position])}
                    </div>
                    <div className="flex justify-center w-full mt-1 mb-2">
                        <button className="text-lg cursor-pointer bg-slate-100 mr-1">👍</button>
                        <button className="text-lg cursor-pointer bg-slate-100 ml-1">👎</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[580px] w-[250px] flex flex-col overflow-hidden">
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

            {/* 메시지 표시 영역 (필요시만 보이도록 수정) */}
            <div className="hidden fixed top-0 left-0 w-full bg-white p-4 z-[9999] 
                          border-b-2 border-gray-200 shadow-lg 
                          overflow-auto max-h-[200px]">
                {Object.entries(playerMessages).map(([userId, message]) => (
                    <p key={userId}>플레이어 {userId}: {message}</p>
                ))}
            </div>
            
            {/* 플레이어 카드 동적 렌더링 */}
            {renderPlayerCard("정답자")}
            {renderPlayerCard("순서1", activeDrawerIndex === 0)}
            {renderPlayerCard("순서2", activeDrawerIndex === 1)}
            {renderPlayerCard("순서3", activeDrawerIndex === 2, true)}
        </div>
    );
};

export default PlayerSection;