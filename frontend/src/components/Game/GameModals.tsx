import React from 'react';
import CustomModal from '../common/CustomModal';
import chick_running from '../../assets/Common/chick_running.gif';
import chick from "../../assets/Common/chick.gif";
import chick_cute from "../../assets/Common/chick_cute.gif"
import chick_sword from "../../assets/Common/chick_sword.png"

// 패스 확인 모달 (chick_running.gif 사용)
export const PassConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => {
  return (
    <CustomModal
      key="pass-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="PASS 확인"
      media={{
        type: 'gif',
        src: chick_running,
        alt: '달리는 병아리 GIF'
      }}
      actionButtons={{
        confirmText: "예",
        cancelText: "아니오",
        onConfirm: onConfirm
      }}
    >
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          정말로 PASS 하시겠습니까?
        </p>
      </div>
    </CustomModal>
  );
};

// 공통 정답 모달 (정답을 맞추면 이 모달만 사용)
export const CorrectAnswerModal = ({ 
  isOpen, 
  onClose, 
  quizWord,
  isHumanTeam = true
}: {
  isOpen: boolean;
  onClose: () => void;
  quizWord: string;
  isHumanTeam?: boolean;
}) => {
  return (
    <CustomModal 
      key="correct-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="정답입니다!" 
      media={{ 
        type: 'gif',
        src: chick,
        alt: '축하 GIF' 
      }} 
      actionButtons={{ 
        confirmText: "계속하기", 
        onConfirm: onClose
      }} 
    >
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          {isHumanTeam 
            ? "축하합니다! 정답을 맞추셨습니다." 
            : "AI가 정답을 맞췄습니다."}
        </p>
      </div>
    </CustomModal>
  );
};

// 빈 입력 모달 (입력 없이 제출 시)
export const EmptyGuessModal = ({ 
  isOpen, 
  onClose 
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <CustomModal 
      key="empty-guess-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="알림" 
      media={{ 
        type: 'gif',
        src: chick_cute,
        alt: '알림 GIF' 
      }} 
      actionButtons={{ 
        confirmText: "확인", 
        onConfirm: onClose
      }} 
    >
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          정답을 입력해주세요!
        </p>
      </div>
    </CustomModal>
  );
};

// 오답 모달 (제시어와 다른 입력 시)
export const WrongGuessModal = ({ 
  isOpen, 
  onClose,
  quizWord
}: {
  isOpen: boolean;
  onClose: () => void;
  quizWord: string;
}) => {
  return (
    <CustomModal 
      key="wrong-guess-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="오답" 
      media={{ 
        type: 'gif',
        src: chick_sword,
        alt: '오답 GIF' 
      }} 
      actionButtons={{ 
        confirmText: "다시 시도", 
        onConfirm: onClose
      }} 
    >
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          틀렸습니다!
        </p>
      </div>
    </CustomModal>
  );
};