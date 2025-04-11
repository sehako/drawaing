// RoundTransition.tsx 파일에서 타이머 타입을 수정합니다

import React, { useEffect, useState } from 'react';

interface RoundTransitionProps {
  isVisible: boolean;
  currentRound: number;
  nextRound: number;
}

const RoundTransition: React.FC<RoundTransitionProps> = ({ 
  isVisible, 
  currentRound,
  nextRound
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // NodeJS.Timeout 대신 number 타입을 사용합니다
    let timer: number;
    
    if (isVisible) {
      setCountdown(3);
      
      timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-yellow-100 rounded-xl p-8 text-center border-4 border-yellow-500 shadow-lg transform scale-110 transition-transform">
        <h2 className="text-3xl font-bold mb-4">
          ROUND {currentRound} → ROUND {nextRound}
        </h2>
        <div className="text-5xl font-extrabold text-yellow-600 my-6 animate-pulse">
          {countdown}초
        </div>
        <p className="text-xl">다음 라운드를 준비하세요!</p>
      </div>
    </div>
  );
};

export default RoundTransition;