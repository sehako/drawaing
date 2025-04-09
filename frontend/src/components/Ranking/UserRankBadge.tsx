import React from 'react';
import { UserRanking } from '../../types/RankingTypes';

const UserRankBadge: React.FC<{ userRank: UserRanking | null }> = ({ userRank }) => (
    <div className="bg-amber-700 p-6 rounded-xl border-4 border-amber-900 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)]">
      <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        내 랭킹
      </h2>
      {userRank ? (
        <div className="space-y-4">
          {/* 닉네임과 캐릭터 이미지 */}
          <div className="flex flex-col items-center space-y-2">
            <img
              src={userRank.characterImage}
              alt={`${userRank.nickname}의 캐릭터 이미지`}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
            <span className="text-lg font-bold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
              {userRank.nickname}
            </span>
          </div>
  
          {/* 순위 */}
          <div className="flex justify-between items-center bg-amber-600 p-3 rounded-lg shadow-md">
            <span className="text-white font-medium">순위:</span>
            <span className="text-xl font-bold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
              {userRank.rank}등
            </span>
          </div>
  
          {/* 점수 */}
          <div className="flex justify-between items-center bg-amber-600 p-3 rounded-lg shadow-md">
            <span className="text-white font-medium">점수:</span>
            <span className="text-xl font-bold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
              {userRank.value}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center text-amber-200 font-medium">
          로그인이 필요합니다
        </div>
      )}
    </div>
  );

export default UserRankBadge;
