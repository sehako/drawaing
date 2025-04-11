// src/components/landing/RoomActionModal.tsx
import React, { useState } from 'react';
import CustomModal from '../common/CustomModal';
import chick from '../../assets/Common/chick.gif'
interface RoomActionModalProps {
  isOpen: boolean;
  closeModal: () => void;
  modalType: 'create' | 'join';
  onConfirm: (inputValue: string) => void;
}

const RoomActionModal: React.FC<RoomActionModalProps> = ({
  isOpen,
  closeModal,
  modalType,
  onConfirm
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (!inputValue.trim()) return;
    onConfirm(inputValue);
    setInputValue('');
  };

  const title = modalType === 'create' ? '새로운 게임방 만들기' : '게임방 찾기';
  const placeholder = modalType === 'create' ? '방 제목을 입력하세요' : '방 코드를 입력하세요';
  const confirmText = modalType === 'create' ? '방 만들기' : '방 찾기';
  const message = modalType === 'create' 
    ? '새로운 닭이 될 준비가 되었나요?' 
    : '어떤 닭장에 들어갈까요?';

  return (
    <CustomModal 
      isOpen={isOpen} 
      onClose={closeModal} 
      title={title}
      media={{
        type: 'gif',
        src: chick,
        alt: '병아리'
      }}
      actionButtons={{
        confirmText: confirmText,
        cancelText: '취소',
        onConfirm: handleConfirm,
        onCancel: closeModal
      }}
    >
      <div className="flex flex-col items-center">
        <p className="text-lg font-pixel mb-4 text-center">
          {message}
        </p>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border-2 border-black rounded-md mb-4 font-pixel text-center"
          autoFocus
        />
      </div>
    </CustomModal>
  );
};

export default RoomActionModal;