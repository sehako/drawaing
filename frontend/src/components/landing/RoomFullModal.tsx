import React from 'react';



// closeModal 함수의 타입을 명시적으로 정의합니다
interface RoomFullModalProps {
    closeModal: () => void;
  }
  
  const RoomFullModal: React.FC<RoomFullModalProps> = ({ closeModal }) => {
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-96">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 font-['Press_Start_2P'] text-center">방 입장 불가!</h2>
          
          <img 
            src="/images/angry-chicken.png" 
            alt="화난 닭" 
            className="w-24 h-24 mb-4" 
          />
          
          <p className="text-lg text-center mb-6">
            이 방은 이미 인원이 꽉 찼습니다. (최대 4명)
          </p>
          
          <button 
            onClick={closeModal}
            className="px-6 py-3 bg-[#ffd62e] rounded-full flex items-center justify-center border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            <span className="font-bold text-black">확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomFullModal;