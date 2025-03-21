import React from 'react';
import CustomModal from '../common/CustomModal';
import chick_running from '../../assets/Common/chick_running.gif';
import chick from "../../assets/Common/chick.gif";

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
      key="pass-modal" // 고유 키 추가
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

// AI 정답 모달 (chick.gif 사용)
export const CorrectAnswerModal = ({ 
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
      key="correct-modal" // 고유 키 추가
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
          축하합니다! 정답을 맞추셨습니다.
        </p>
      </div>
    </CustomModal>
  );
};

// 캔버스용 정답 모달 (chick_running.gif 사용)
export const CanvasCorrectModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  quizWord
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quizWord: string;
}) => {
  return (
    <CustomModal
      key="canvas-correct-modal" // 고유 키 추가
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
        onConfirm: onConfirm
      }}
    >
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          정답은 "{quizWord}"입니다!
        </p>
        <p className="text-green-600 font-bold">
          축하합니다! 정답을 맞추셨습니다.
        </p>
      </div>
    </CustomModal>
  );
};