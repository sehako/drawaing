import React from 'react';
import { motion } from 'framer-motion';
import { Ranking } from '../../types/RankingTypes';

const RankingList: React.FC<{ 
  rankings: Ranking[]; 
  page: number;
  pageSize: number;
}> = ({ rankings, page, pageSize }) => (
  <div className="bg-amber-50 rounded-xl border-4 border-amber-900 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] p-6">
    <div className="grid gap-4">
      {rankings.map((ranking, index) => {
        const globalIndex = page * pageSize + index + 1;
        return (
          <motion.div
            key={ranking.memberId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }} // 순차적으로 나타남
            className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-amber-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="font-bold w-8">#{globalIndex}</span>
              <img
                src={ranking.characterImage}
                alt={`${ranking.nickname}의 캐릭터 이미지`}
                className="w-16 h-16 rounded-full border-2 border-amber-200 shadow-md"
              />
              <span>{ranking.nickname}</span>
            </div>
            <span className="font-bold text-amber-700">{ranking.value}</span>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default RankingList;
