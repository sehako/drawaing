import React from 'react';
import baby from '../../assets/Game/baby.png';
import angry from '../../assets/Game/angry.png';
import chicken from '../../assets/Game/chicken.png';
import kid from '../../assets/Game/kid.png';
import max from '../../assets/Game/max.png';

interface PlayerSectionProps {
  currentRound: number; // 현재 라운드
  activeDrawerIndex: number; // 현재 그리고 있는 사람 인덱스
  guesserIndex: number; // 정답 맞추는 사람 인덱스
  roomId: string; // 방 ID
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

const PlayerSection: React.FC<PlayerSectionProps> = ({ currentRound = 1, activeDrawerIndex = 0 }) => {
    // 고정된 플레이어 데이터 
    const players: PlayerList = {
        "김률아": { level: 12, avatar: baby },
        "문상혁": { level: 50, avatar: max },
        "차정문": { level: 25, avatar: angry },
        "김예훈": { level: 16, avatar: chicken }
    };
    
    // 라운드별 플레이어 배치 정의 (고정)
    const roundPositions: RoundPositions = {
        1: {
            "정답자": "김률아",
            "순서1": "문상혁",
            "순서2": "차정문",
            "순서3": "김예훈"
        },
        2: {
            "정답자": "문상혁",
            "순서1": "차정문",
            "순서2": "김예훈",
            "순서3": "김률아"
        },
        3: {
            "정답자": "차정문",
            "순서1": "김예훈",
            "순서2": "김률아",
            "순서3": "문상혁"
        },
        4: {
            "정답자": "김예훈",
            "순서1": "김률아",
            "순서2": "문상혁",
            "순서3": "차정문"
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
    
    return (
        <div className="h-[580px] w-[250px] flex flex-col pr-2 overflow-hidden">
        {/* 정답자 */}
            <div className="h-[135px] flex border-4 border-purple-600 p-2 rounded-lg bg-[#FDE047] relative mb-3 mt-1 ml-1">
                <div className="absolute -top-2 -left-2 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded-md shadow">
                    정답자
                </div>
                
                <div className="w-[70%] h-full flex items-center justify-center">
                    <img src={getPlayerInfo(currentPositions["정답자"]).avatar} alt={currentPositions["정답자"]} className="object-contain h-full w-full" />
                </div>
                <div className="w-[45%] h-full flex flex-col justify-between items-center pl-2">
                    <div className="text-gray-800 font-bold text-base mt-3">{currentPositions["정답자"]}</div>
                    <div className="text-m text-gray-600">Lv.{getPlayerInfo(currentPositions["정답자"]).level}</div>
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
                    <div className="text-gray-800 font-bold text-base mt-3">{currentPositions["순서1"]}</div>
                    <div className="text-m text-gray-600">Lv.{getPlayerInfo(currentPositions["순서1"]).level}</div>
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
                    <div className="text-gray-800 font-bold text-base mt-3">{currentPositions["순서2"]}</div>
                    <div className="text-m text-gray-600">Lv.{getPlayerInfo(currentPositions["순서2"]).level}</div>
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
                    <div className="text-gray-800 font-bold text-base mt-3">{currentPositions["순서3"]}</div>
                    <div className="text-m text-gray-600">Lv.{getPlayerInfo(currentPositions["순서3"]).level}</div>
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