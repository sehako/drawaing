import React from 'react';
import { Ranking } from '../../types/RankingTypes';

interface RankingListProps {
  rankings: Ranking[];
  page: number;
  pageSize: number;
}

const RankingList: React.FC<RankingListProps> = ({ rankings, page, pageSize }) => {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rankings.map((ranking, index) => {
        const globalIndex = page * pageSize + index + 1;

        return (
          <li
            key={ranking.memberId}
            className={`p-4 rounded-lg border shadow-md ${
              index === 0
                ? 'bg-yellow-400'
                : index === 1
                ? 'bg-gray-400'
                : index === 2
                ? 'bg-orange-400'
                : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">#{globalIndex}</span>
              <span className="text-sm text-gray-600">{ranking.nickname}</span>
            </div>
            <p className="mt-2 text-gray-800">점수: {ranking.value}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default RankingList;
