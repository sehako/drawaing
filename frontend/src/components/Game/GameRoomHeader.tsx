import React, { useEffect, useState } from 'react';
import CustomModal from '../common/CustomModal';
import sad_chick from '../../assets/Common/sad_chick.gif'

interface GameRoomHeaderProps {
  roomName: string;
  displayRoomCode: string | null;
  isConnected: boolean;
  onShowInstructions: () => void;
  onLeaveRoom: () => void;
  onCopyRoomCode: () => void;
}

const GameRoomHeader: React.FC<GameRoomHeaderProps> = ({
  roomName,
  displayRoomCode,
  isConnected,
  onShowInstructions,
  onLeaveRoom,
  onCopyRoomCode
}) => {
  const [roomTitle, setRoomTitle] = useState<string>("");
  const [isLocalHost, setIsLocalHost] = useState<boolean>(false);
  // 방 나가기 모달 상태 추가
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  useEffect(() => {
    // 로컬 스토리지에서 방장 여부 확인
    const storedIsHost = localStorage.getItem('isHost') === 'true';
    setIsLocalHost(storedIsHost);

    // 방장인 경우와 일반 플레이어인 경우에 따라 방 제목 설정
    if (storedIsHost) {
      // 방장인 경우 생성 시 입력한 제목 사용 (로컬 스토리지에서 가져옴)
      const createdRoomTitle = localStorage.getItem('roomTitle');
      if (createdRoomTitle) {
        setRoomTitle(createdRoomTitle);
      } else {
        // 없는 경우 props로 전달된 값 사용
        setRoomTitle(roomName || "닭장");
      }
    } else {
      // 일반 플레이어인 경우 props로 전달된 값 사용 (서버에서 온 데이터)
      setRoomTitle(roomName || "닭장");
    }
  }, [roomName]);

  // 방 나가기 버튼 클릭 핸들러 추가
  const handleLeaveClick = () => {
    setShowLeaveModal(true);
  };

  // 방 나가기 확인 핸들러 - window.confirm 제거
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    // 직접 방 나가기 함수 호출
    onLeaveRoom();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 z-20">
        {/* 방 이름 나무 판자와 복사하기 버튼 컨테이너 */}
        <div className="flex items-center space-x-2">
          {/* 나무 판자 */}
          <div className="relative">
            {/* 나무 판자 배경 */}
            <div className="relative bg-amber-800 rounded-lg px-4 py-3 transform rotate-1 border-4 border-amber-900 shadow-[5px_5px_0_0_rgba(0,0,0,0.3)]">
              {/* 나뭇결 효과 */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-1 bg-amber-950 rounded-full my-1"></div>
                <div className="w-full h-1 bg-amber-950 rounded-full my-2"></div>
                <div className="w-full h-1 bg-amber-950 rounded-full my-3"></div>
                <div className="w-full h-1 bg-amber-950 rounded-full my-1"></div>
                <div className="w-full h-1 bg-amber-950 rounded-full my-2"></div>
              </div>
              
              {/* 방 이름 텍스트 */}
              <div className="flex flex-col items-start">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-['Press_Start_2P'] text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                  {roomTitle} <span className="mt-1 text-xs sm:text-sm text-amber-200">방 코드: {displayRoomCode || '로딩 중...'} {/* 복사하기 버튼 */}
          {displayRoomCode && (
            <button
              onClick={onCopyRoomCode}
              
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              
            </button>
          )}</span>
                </h1>
              </div>
              
              {/* 나무 판자 못 효과 */}
              <div className="absolute -top-2 -left-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
              <div className="absolute -bottom-2 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
            </div>
          </div>
        </div>
        
        {/* 연결 상태 표시 */}
        <div className={`absolute -top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {isConnected ? '연결됨' : '연결 중...'}
        </div>
        
        {/* 버튼 그룹 */}
        <div className="flex space-x-2">
          {/* 게임 설명 버튼 */}
          <button 
            onClick={onShowInstructions}
            className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-blue-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
          >
            게임 설명
          </button>
          
          {/* 방 나가기 버튼 - 직접 나가지 않고 모달 표시로 변경 */}
          <button 
            onClick={handleLeaveClick} // onLeaveRoom에서 handleLeaveClick으로 변경
            className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-red-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
          >
            방 나가기
          </button>
        </div>
      </div>

      {/* 방 나가기 확인 모달 추가 */}
      <CustomModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="방 나가기"
        media={{
          type: 'gif',
          src: sad_chick,
          alt: '슬픈 병아리'
        }}
      >
        <div className="flex flex-col items-center text-center">
          <p className="text-lg font-pixel mb-4">
            정말로 이 닭장을 떠나시겠습니까?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            게임을 종료하고 메인 화면으로 돌아갑니다.
          </p>
          
          {/* 동일한 너비의 "예", "아니오" 버튼 직접 추가 */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleConfirmLeave}
              className="px-6 py-2 bg-yellow-200 text-black rounded hover:bg-yellow-600 w-[100px] border-2 border-black font-pixel"
            >
              예
            </button>
            <button
              onClick={() => setShowLeaveModal(false)}
              className="px-6 py-2 bg-yellow-200 text-black rounded hover:bg-yellow-600 w-[100px] border-2 border-black font-pixel"
            >
              아니오
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default GameRoomHeader;