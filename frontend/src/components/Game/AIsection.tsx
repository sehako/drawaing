import React, { useState, useEffect } from 'react';
import dambi from '../../assets/Game/dambi.png';
import egg from '../../assets/Game/egg.png';
import { PassConfirmModal, CorrectAnswerModal, EmptyGuessModal, WrongGuessModal } from './GameModals';

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
  predictions: { class: string; probability: number }[];  // 예측 데이터
  canPass?: boolean; // PASS 가능 여부
  passCount?: number; // 현재 PASS 횟수
  isHumanCorrect?: boolean;
  setIsHumanCorrect?: React.Dispatch<React.SetStateAction<boolean>>;
  isEmptyGuess?: boolean;
  setIsEmptyGuess?: React.Dispatch<React.SetStateAction<boolean>>;
  isWrongGuess?: boolean;
  setIsWrongGuess?: React.Dispatch<React.SetStateAction<boolean>>;
  guessSubmitCount?: number; // 추가: 현재까지 사용한 제출 횟수
  maxGuessSubmitCount?: number; // 추가: 최대 제출 가능 횟수
  canAnswer?: boolean;
  onSubmitMessage: (id: number, message: string) => void; // 추가

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
  onAICorrectAnswer,
  predictions,
  canPass = false,
  passCount = 0,
  isHumanCorrect = false,
  setIsHumanCorrect = () => {},
  isEmptyGuess = false,
  setIsEmptyGuess = () => {},
  isWrongGuess = false,
  setIsWrongGuess = () => {},
  guessSubmitCount = 0,
  maxGuessSubmitCount = 3, // 기본값 3으로 설정
  canAnswer = false, // 기본값을 false로 설정
  onSubmitMessage,

}) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  
  const [isEmptyGuessModalOpen, setIsEmptyGuessModalOpen] = useState(false);
  const [isWrongGuessModalOpen, setIsWrongGuessModalOpen] = useState(false);
  // 이 autoCloseCounter 상태는 필요 없음 - 모달 컴포넌트 내부에서 처리됨
  // const [autoCloseCounter, setAutoCloseCounter] = useState(5);

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

  useEffect(() => {
    if (isHumanCorrect) {
      openCorrectModal();
      setIsHumanCorrect(false);
    }
  }, [isHumanCorrect]);

  useEffect(() => {
    if (isEmptyGuess) {
      setIsEmptyGuessModalOpen(true);
      setIsEmptyGuess(false);
    }
  }, [isEmptyGuess]);
  
  useEffect(() => {
    if (isWrongGuess) {
      setIsWrongGuessModalOpen(true);
      setIsWrongGuess(false);
    }
  }, [isWrongGuess]);

useEffect(() => {
  let timer: number;
  if (isEmptyGuessModalOpen) {
    timer = window.setTimeout(() => {
      setIsEmptyGuessModalOpen(false);
    }, 3000);
  }
  return () => window.clearTimeout(timer);
}, [isEmptyGuessModalOpen]);

useEffect(() => {
  let timer: number;
  if (isWrongGuessModalOpen) {
    timer = window.setTimeout(() => {
      setIsWrongGuessModalOpen(false);
    }, 3000);
  }
  return () => window.clearTimeout(timer);
}, [isWrongGuessModalOpen]);
  
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[250px] h-full flex flex-col bg-yellow-100 rounded-lg border-2 border-yellow-300 shadow-sm">
        {/* 첫 번째 이미지 컨테이너 */}
        <div className="flex-grow flex flex-col items-center justify-center bg-yellow-200 rounded-lg overflow-hidden m-2">
          <img 
            src={dambi} 
            alt="dambi" 
            className="w-100% h-100% object-cover" 
          />
        </div>
        
        {/* 두 번째 이미지 컨테이너 */}
        <div className="flex-grow flex flex-col items-center justify-center bg-yellow-200 rounded-lg overflow-hidden mb-2 relative mx-2">
          <div className="w-60% h-80% flex items-center justify-center">
            <img 
              src={egg} 
              alt="계란 이미지" 
              className="object-contain w-[200px] h-full" 
            />
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-4xl bg-yellow-200 text-black py-2 rounded-full font-bold">
            X{eggCount}
          </div>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex flex-col space-y-2 mx-2 mb-2">
        <button 
            onClick={openPassModal}
            disabled={!canPass}
            className={`h-[52px] w-full text-white font-medium rounded-[10px] 
              ${canPass 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'bg-orange-500 cursor-not-allowed'
              }`}
          >
            {canPass 
              ? `PASS (${3 - passCount}회)` 
              : '패스'}
          </button>
          <button 
          onClick={(e) => {
            e.preventDefault();
            handleGuessSubmit(e as unknown as React.FormEvent);
          }}
          disabled={!canAnswer || guessSubmitCount >= maxGuessSubmitCount}
          className={`h-[52px] w-full text-white font-medium rounded-[10px] 
            ${!canAnswer 
              ? 'bg-green-500 opacity-50 cursor-not-allowed' 
              : guessSubmitCount < maxGuessSubmitCount 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-green-500 opacity-50 cursor-not-allowed'
            }`}
        >
          {!canAnswer 
            ? '정답 제출 불가' 
            : guessSubmitCount < maxGuessSubmitCount 
              ? `제출 (${maxGuessSubmitCount - guessSubmitCount}회)` 
              : '제출 횟수 소진'}
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
        isHumanTeam={true} // Add this prop to specify it's the human team
      />

      <EmptyGuessModal 
        isOpen={isEmptyGuessModalOpen}
        onClose={() => setIsEmptyGuessModalOpen(false)}
      />
      <WrongGuessModal 
        isOpen={isWrongGuessModalOpen}
        onClose={() => setIsWrongGuessModalOpen(false)}
        quizWord={quizWord}
      />
    </div>
  );
};

export default AISection;