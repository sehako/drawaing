import React from 'react';
import { Ranking } from '../../types/RankingTypes';

const Podium: React.FC<{ rankings: Ranking[] }> = ({ rankings }) => (
  <div className="bg-amber-50 p-6 rounded-xl border-4 border-amber-900 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)]">
    <h2 className="text-2xl font-bold mb-4 text-center">🏅 TOP 3</h2>
    <div className="flex items-end justify-center h-[253px] gap-4">
      {/* 2등 */}
      {rankings[1] && (
        <div className="w-1/3 flex flex-col items-center">
          {/* 메달 */}
          <div className="text-4xl mb-2">🥈</div>
          {/* 카드 */}
          <div className="bg-gray-200 h-40 rounded-t-xl flex flex-col items-center p-3">
            {/* 이미지 */}
            {rankings[1].characterImage && (
              <img
                src={rankings[1].characterImage}
                alt={`${rankings[1].nickname}의 캐릭터 이미지`}
                className="w-[50px] h-[50px] rounded-full border-2 border-white shadow-md mb-2"
              />
            )}
            {/* 닉네임과 값 */}
            <div className="font-bold">{rankings[1].nickname}</div>
            <div>{rankings[1].value}</div>
          </div>
        </div>
      )}

      {/* 1등 */}
      {rankings[0] && (
        <div className="w-1/3 flex flex-col items-center">
          {/* 메달 */}
          <div className="text-4xl mb-2">🥇</div>
          {/* 카드 */}
          <div className="bg-yellow-300 h-52 rounded-t-xl flex flex-col items-center p-3">
            {/* 이미지 */}
            {rankings[0].characterImage && (
              <img
                src={rankings[0].characterImage}
                alt={`${rankings[0].nickname}의 캐릭터 이미지`}
                className="w-[50px] h-[50px] rounded-full border-2 border-white shadow-md mb-2"
              />
            )}
            {/* 닉네임과 값 */}
            <div className="font-bold">{rankings[0].nickname}</div>
            <div>{rankings[0].value}</div>
          </div>
        </div>
      )}

      {/* 3등 */}
      {rankings[2] && (
        <div className="w-1/3 flex flex-col items-center">
          {/* 메달 */}
          <div className="text-4xl mb-2">🥉</div>
          {/* 카드 */}
          <div className="bg-orange-300 h-32 rounded-t-xl flex flex-col items-center p-3">
            {/* 이미지 */}
            {rankings[2].characterImage && (
              <img
                src={rankings[2].characterImage}
                alt={`${rankings[2].nickname}의 캐릭터 이미지`}
                className="w-[50px] h-[50px] rounded-full border-2 border-white shadow-md mb-2"
              />
            )}
            {/* 닉네임과 값 */}
            <div className="font-bold">{rankings[2].nickname}</div>
            <div>{rankings[2].value}</div>
          </div>
        </div>
      )}
    </div>
  </div>

);

export default Podium;
