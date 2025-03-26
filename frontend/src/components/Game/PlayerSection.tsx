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
  roomId: string;
  isConnected?: boolean;
  playerConnections?: PlayerConnectionMap; // 플레이어 접속 상태 맵
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


const PlayerSection: React.FC<PlayerSectionProps> = ({ 
  currentRound = 1, 
  activeDrawerIndex = 0, 
  guesserIndex = 0, 
  roomId = "1", 
  isConnected = false,
  playerConnections = {} 
}) => {
    // 고정된 플레이어 데이터
    const players: PlayerList = {
        "플레이어1": { level: 12, avatar: baby },
        "플레이어2": { level: 50, avatar: max },
        "플레이어3": { level: 25, avatar: angry },
        "플레이어4": { level: 16, avatar: chicken }
    };
    
    // 라운드별 플레이어 배치 정의 (고정)
    const roundPositions: RoundPositions = {
        1: {
            "정답자": "플레이어1",
            "순서1": "플레이어2",
            "순서2": "플레이어3",
            "순서3": "플레이어4"
        },
        2: {
            "정답자": "플레이어2",
            "순서1": "플레이어3",
            "순서2": "플레이어4",
            "순서3": "플레이어1"
        },
        3: {
            "정답자": "플레이어3",
            "순서1": "플레이어4",
            "순서2": "플레이어1",
            "순서3": "플레이어2"
        },
        4: {
            "정답자": "플레이어4",
            "순서1": "플레이어1",
            "순서2": "플레이어2",
            "순서3": "플레이어3"
        }
    };
    
    // 현재 라운드에 맞는 플레이어 배치 가져오기
    const getCurrentPositions = (): PositionMap => {
        // 라운드가 4보다 크면 반복되도록 계산
        const normalizedRound = ((currentRound - 1) % 4) + 1;
        return roundPositions[normalizedRound] || roundPositions[1];
    };
    
    // 현재 라운드의 플레이어 배치
    const currentPositions = getCurrentPositions();
    
    // 플레이어 이름에 해당하는 플레이어 정보 가져오기 (타입 안전)
    const getPlayerInfo = (name: string): PlayerInfo => {
        if (name in players) {
            return players[name];
        }
        // 기본값 반환 (에러 방지)
        return { level: 0, avatar: baby };
    };

    // 플레이어 접속 상태 가져오기 (개선된 로직)
    const getPlayerConnectionStatus = (playerName: string): boolean => {
        // 플레이어 접속 상태가 명시적으로 false로 설정되지 않은 한 true로 간주
        return playerConnections[playerName] ?? true;
    };

    // 접속 상태 텍스트 표시
    const getConnectionStatusText = (playerName: string): string => {
        return getPlayerConnectionStatus(playerName) ? '(접속중)' : '(접속하지 않음)';
    };
    
    return (
        <div className="h-[580px] w-[250px] flex flex-col overflow-hidden">
            {/* 방 정보 표시 */}
            {/* <div className="w-full mb-2 p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-center">
                <div className="font-bold">방 #{roomId}</div>
                <div className={`mt-1 text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? '실시간 접속 상태 확인 중' : '연결 중...'}
                </div>
            </div> */}
            
            {/* 정답자 */}
            <div className="h-[135px] flex border-4 border-purple-600 p-2 rounded-lg bg-[#FDE047] relative mb-3 mt-1 ml-1">
                <div className="absolute -top-2 -left-2 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow">
                    정답자
                </div>
                
                <div className="w-[55%] h-full flex items-center justify-center">
                    <img src={getPlayerInfo(currentPositions["정답자"]).avatar} alt={currentPositions["정답자"]} className="object-contain h-full w-full" />
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
                
                <div className="w-[55%] h-full flex items-center justify-center">
                    <img src={getPlayerInfo(currentPositions["순서1"]).avatar} alt={currentPositions["순서1"]} className="object-contain h-full w-full" />
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
                
                <div className="w-[55%] h-full flex items-center justify-center">
                    <img src={getPlayerInfo(currentPositions["순서2"]).avatar} alt={currentPositions["순서2"]} className="object-contain h-full w-full" />
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
                
                <div className="w-[55%] h-full flex items-center justify-center">
                    <img src={getPlayerInfo(currentPositions["순서3"]).avatar} alt={currentPositions["순서3"]} className="object-contain h-full w-full" />
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