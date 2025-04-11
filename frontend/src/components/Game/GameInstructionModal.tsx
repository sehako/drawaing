import React, { useState } from 'react';

interface GameInstructionModalProps {
    onClose: () => void;
    onDontShowAgain: (value: boolean) => void;  // 이 prop 추가
  }

interface GameInstructionModalProps {
  onClose: () => void;
  onDontShowAgain: (value: boolean) => void;  // 이 prop 추가
}
const GameInstructionModal: React.FC<GameInstructionModalProps> = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const handleClose = () => {
    if (dontShowAgain) {
      // 다시 보지 않기 설정을 저장
      localStorage.setItem('gameInstructionDontShowAgain', 'true');
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-3xl border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* 타이틀 */}
          <h2 className="text-2xl md:text-4xl font-bold font-['Press_Start_2P'] text-amber-800 text-center mb-6">
            게임 설명
          </h2>
          
          {/* 게임 설명 내용 */}
          <div className="space-y-6 text-base md:text-lg">
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">🐓 게임 목표</h3>
              <p>AI와 유저 팀이 캐치마인드 대결을 펼칩니다! 제한 시간 10분 동안 AI보다 더 많은 라운드를 <br />승리하면 최종 승리합니다.</p>
            </div>
            
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">🎮 게임 방법</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>한 라운드마다 3번의 턴이 진행됩니다.</li>
                <p>- 1번째 유저가 그림을 그리면, 나머지 3명의 유저가 제시어를 맞힙니다.</p>
                <p>- 2번째 유저가 1번째 유저의 그림을 이어 받아 그림을 그리면, 남은 2명의 유저가 맞힙니다.</p>
                <p>- 3번째 유저가 2번재 유저의 그림을 보고 다시 그림을 그리면, 마지막 남은 유저가 <br />  <span className='ml-3'>      맞힙니다.</span></p>
                <li>모든 그림은 한 붓 그리기(클릭을 한 번만 떼지 않고 그리기)로만 가능합니다.</li>
                <li>각 유저는 라운드당 3번의 답안 제출 기회가 주어지므로 신중하게 답해주세요.</li>
              </ol>
            </div>
            
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">⏱️ 시간 제한</h3>
              <p>- 게임 전체 시간 : 10분</p>
              <p>- 각 턴의 시간(그림 그리기 및 정답 맞히기) : 20초</p>
            </div>
            
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">💯 점수 계산</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>정답자: 턴이 적게 진행되어 빠르게 맞출수록 더 많은 점수 획득</li>
                <li>그림 작가: 다른 플레이어가 정답을 맞출 때마다 점수 획득</li>
              </ul>
            </div>
          </div>
          
          {/* 체크박스와 확인 버튼 */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer mb-4 md:mb-0">
              <input 
                type="checkbox" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm md:text-base">다시 보지 않기</span>
            </label>
            
            <button 
              onClick={handleClose}
              className="px-6 py-3 bg-[#ffd62e] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-lg font-bold transition-all duration-200"
            >
              확인했어요!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInstructionModal;