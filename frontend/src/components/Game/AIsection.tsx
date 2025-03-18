import React from 'react';
import badguy from '../../assets/Game/badguy.jpg'
import word from '../../assets/Game/word.png'

interface AISectionProps {
  aiImages: string[];
  aiAnswer: string;
  guess: string;
  setGuess: React.Dispatch<React.SetStateAction<string>>;
  handleGuessSubmit: (e: React.FormEvent) => void;
  handlePass?: () => void;
}

const AISection: React.FC<AISectionProps> = ({
  aiImages,
  aiAnswer,
  guess,
  setGuess,
  handleGuessSubmit,
  handlePass
}) => {
  return (
    <div className="h-[580px] w-[240px] flex flex-col overflow-hidden">
      {/* 첫 번째 이미지 컨테이너 - 고정 높이 지정 */}
      <div className="h-[320px] bg-white rounded-lg overflow-hidden mb-2">
        <img src={badguy} alt="badguy" className="w-full h-full object-cover" />
      </div>
      
      {/* 두 번째 이미지 컨테이너 - 고정 높이 지정 */}
      <div className="h-[230px] bg-white rounded-lg overflow-hidden mb-2">
        <img 
          src={aiImages[1] || '/ai/eggs.png'} 
          alt="AI Answer" 
          className="w-full h-full object-contain" 
        />
      </div>
      
      {/* 버튼 영역 - 불필요한 여백 제거 */}
      <div className="flex flex-col h-[120px]">
        <button 
          onClick={() => handlePass && handlePass()}
          className="h-[52px] w-full bg-orange-500 text-white font-medium hover:bg-orange-600 mb-2 rounded-[10px]"
        >
          PASS
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            handleGuessSubmit(e as any);
          }}
          className="h-[52px] w-full bg-green-500 text-white font-medium hover:bg-green-600 mb-0 rounded-[10px]"
        >
          제출
        </button>
      </div>
    </div>
  );
};

export default AISection;