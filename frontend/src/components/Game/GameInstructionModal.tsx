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
              <p>AI와 유저 팀의 그림 맞추기 대결을 합니다! 주어진 제시어를 보고 그림을 그리면 다른 플레이어들이 맞춰야 합니다.</p>
            </div>
            
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">🎮 게임 방법</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>각 라운드마다 한 플레이어가 그림을 그리는 역할을 맡습니다.</li>
                <li>그림을 그리는 플레이어는 제시어를 보고 그 단어를 표현하는 그림을 그립니다.</li>
                <li>다른 플레이어들은 채팅창에 답을 입력하여 그림이 무엇인지 맞춰야 합니다.</li>
                <li>정답을 맞춘 플레이어와 그림을 그린 플레이어 모두 점수를 얻습니다.</li>
                <li>모든 플레이어가 한 번씩 그림을 그리면 게임이 종료됩니다.</li>
              </ol>
            </div>
            
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">⏱️ 시간 제한</h3>
              <p>그림을 그리는 시간과 맞추는 시간은 각각 60초로 제한됩니다. 시간 내에 그림을 완성하고 정답을 맞춰보세요!</p>
            </div>
            
            <div className="bg-amber-100 rounded-xl p-4 border-4 border-amber-800">
              <h3 className="text-xl font-bold mb-2">💯 점수 계산</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>정답자: 빠르게 맞출수록 더 많은 점수 획득</li>
                <li>그림 작가: 다른 플레이어가 정답을 맞출 때마다 점수 획득</li>
                <li>추가 보너스: 창의적인 그림이나 재미있는 그림에 투표받으면 보너스 점수!</li>
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