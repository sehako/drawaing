import React, { useState, useEffect } from 'react';
import dambi from '../../assets/Game/dambi.png';
import egg from '../../assets/Game/egg.png';
import { PassConfirmModal, EmptyGuessModal, WrongGuessModal } from './GameModals';

// AI 말풍선 컴포넌트 추가
const AI말풍선 = ({ playerMessages }: { playerMessages?: Record<number | string, string> }) => {
  if (!playerMessages || !playerMessages.ai) return null;

  return (
    <div className="absolute top-[-80px] left-[10px] w-[230px] z-50">
      <div className="bg-blue-100 p-3 rounded-xl shadow-lg border-2 border-blue-500 relative">
        <div className="text-xs font-bold text-blue-800 mb-1">담비(AI)</div>
        <p className="text-sm text-blue-900 font-medium break-words">{playerMessages.ai}</p>
        {/* AI 말풍선 아래쪽 화살표 */}
        <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 
                          border-l-[10px] border-l-transparent 
                          border-t-[10px] border-t-blue-500 
                          border-r-[10px] border-r-transparent"></div>
        </div>
      </div>
    </div>
  );
};

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
  predictions: { result: string; correct: boolean };
  canPass?: boolean;
  passCount?: number;
  isHumanCorrect?: boolean;
  setIsHumanCorrect?: React.Dispatch<React.SetStateAction<boolean>>;
  isEmptyGuess?: boolean;
  setIsEmptyGuess?: React.Dispatch<React.SetStateAction<boolean>>;
  isWrongGuess?: boolean;
  setIsWrongGuess?: React.Dispatch<React.SetStateAction<boolean>>;
  guessSubmitCount?: number;
  maxGuessSubmitCount?: number;
  canAnswer?: boolean;
  onSubmitMessage: (id: number, message: string) => void;
  playerMessages?: Record<number | string, string>;
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
  maxGuessSubmitCount = 3,
  canAnswer = false,
  onSubmitMessage,
  playerMessages,
}) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  
  const [isEmptyGuessModalOpen, setIsEmptyGuessModalOpen] = useState(false);
  const [isWrongGuessModalOpen, setIsWrongGuessModalOpen] = useState(false);

  const openPassModal = () => {
    setIsCorrectModalOpen(false);
    
    setTimeout(() => {
      setIsPassModalOpen(true);
    }, 50);
  };

  const closePassModal = () => {
    setIsPassModalOpen(false);
  };

  const openCorrectModal = () => {
    setIsPassModalOpen(false);
    
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
    <div className="w-full h-full flex justify-center items-center relative">
      {/* AI 말풍선 추가 */}
      <AI말풍선 playerMessages={playerMessages} />

      <div className="w-[250px] h-full flex flex-col bg-yellow-100 rounded-lg border-2 border-yellow-300 shadow-sm">
        {/* 첫 번째 이미지 컨테이너 */}
        <div className="flex-grow flex flex-col items-center justify-center bg-yellow-200 rounded-lg overflow-hidden m-2">
          <AI말풍선 playerMessages={playerMessages} />
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
        {/* <button 
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
          </button> */}
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
      
      {/* 모달들 */}
      <PassConfirmModal 
        isOpen={isPassModalOpen} 
        onClose={closePassModal} 
        onConfirm={handleConfirmPass} 
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