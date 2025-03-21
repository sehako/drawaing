import React, { useState } from 'react';
import badguy from '../../assets/Game/badguy.jpg';
import egg from '../../assets/Game/egg.png';
import { PassConfirmModal, CorrectAnswerModal } from './GameModals';

interface AISectionProps {
  aiImages: string[];
  aiAnswer: string;
  guess: string;
  setGuess: React.Dispatch<React.SetStateAction<string>>;
  handleGuessSubmit: (e: React.FormEvent) => void;
  handlePass?: () => void;
  eggCount: number;
  onAICorrectAnswer: () => void;
  quizWord: string;
}

const AISection: React.FC<AISectionProps> = ({
  aiImages,
  aiAnswer,
  guess,
  setGuess,
  handleGuessSubmit,
  handlePass,
  eggCount,
  quizWord,
  onAICorrectAnswer
}) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);

  const openPassModal = () => {
    // 정답 모달이 열려있으면 먼저
    setIsCorrectModalOpen(false);
    
    // 약간 지연 후 패스 모달 열기
    setTimeout(() => {
      setIsPassModalOpen(true);
    }, 50);
  };

  const closePassModal = () => {
    setIsPassModalOpen(false);
  };

  const openCorrectModal = () => {
    // 패스 모달이 열려있으면 먼저 닫기
    setIsPassModalOpen(false);
    
    // 약간 지연 후 정답 모달 열기
    setTimeout(() => {
      setIsCorrectModalOpen(true);
    }, 50);
  };

  const closeCorrectModal = () => {
    setIsCorrectModalOpen(false);
  };

  const handleConfirmPass = () => {
    if (handlePass) {
      handlePass();
    }
    closePassModal();
  };

  const handleAISubmit = () => {
    if (aiAnswer.trim().toLowerCase() === quizWord.toLowerCase()) {
      onAICorrectAnswer();
      openCorrectModal();
    }
    handleGuessSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[250px] h-[580px] flex flex-col bg-yellow-100 rounded-lg border-2 border-yellow-300 shadow-sm">
        {/* 첫 번째 이미지 컨테이너 */}
        <div className="flex-grow flex flex-col items-center justify-center bg-yellow-200 rounded-lg overflow-hidden m-2">
          <img 
            src={badguy} 
            alt="badguy" 
            className="w-100% h-100% object-cover" 
          />
        </div>
        
        {/* 두 번째 이미지 컨테이너 */}
        <div className="flex-grow flex flex-col items-center justify-center bg-yellow-200 rounded-lg overflow-hidden mb-2 relative mx-2 mr-4">
          <div className="w-60% h-80% flex items-center justify-center">
            <img 
              src={egg} 
              alt="계란 이미지" 
              className="object-contain w-[200px] h-full" 
            />
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-yellow-200 text-black py-2 rounded-full text-lg font-bold mr-4">
            X{eggCount}
          </div>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex flex-col space-y-2 mx-2 mb-2">
          <button 
            onClick={openPassModal}
            className="h-[52px] w-full bg-orange-500 text-white font-medium hover:bg-orange-600 rounded-[10px]"
          >
            PASS
          </button>
          <button 
            onClick={handleAISubmit}
            className="h-[52px] w-full bg-green-500 text-white font-medium hover:bg-green-600 rounded-[10px]"
          >
            제출
          </button>
        </div>
      </div>
      
      {/* 별도 컴포넌트로 분리된 모달들 */}
      <PassConfirmModal 
        isOpen={isPassModalOpen} 
        onClose={closePassModal} 
        onConfirm={handleConfirmPass} 
      />
      
      <CorrectAnswerModal 
        isOpen={isCorrectModalOpen} 
        onClose={closeCorrectModal}
        quizWord={quizWord}
      />
    </div>
  );
};

export default AISection;