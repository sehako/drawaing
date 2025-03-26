import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext'; // MusicContext의 useMusic 훅 임포트
import GameInstructionModal from '../components/Game/GameInstructionModal';

// 타입 정의
interface Player {
  id: string;
  nickname: string;
  isReady: boolean;
  isHost: boolean;
  character?: string; // 캐릭터 이미지 경로
}

const GameWaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [roomName, setRoomName] = useState<string>('즐거운 게임방');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showInstructionModal, setShowInstructionModal] = useState<boolean>(false);
  
  // MusicContext 가져오기
  const { setPlaying, currentTrack } = useMusic();
  
  // 컴포넌트 마운트 시 항상 모달 표시
  useEffect(() => {
    // 로컬 스토리지에서 '다시 보지 않기' 설정 확인
    const dontShowAgain = localStorage.getItem('gameInstructionDontShowAgain');
    
    // '다시 보지 않기'를 선택한 경우에만 모달을 표시하지 않음
    if (dontShowAgain === 'true') {
      setShowInstructionModal(false);
    } else {
      setShowInstructionModal(true);
    }
  }, []);
  
  // 게임 설명 모달 관련 함수들
  const handleShowInstructions = () => {
    setShowInstructionModal(true);
  };
  
  // 모달 닫기 함수
  const closeInstructionModal = () => {
    setShowInstructionModal(false);
  };

  // 다시 보지 않기 설정 함수
  const setDontShowAgain = (value: boolean) => {
    if (value) {
      localStorage.setItem('gameInstructionDontShowAgain', 'true');
    }
  };

  // 현재 경로에 따라 음악이 자동으로 변경되도록 MusicContext를 수정해야 합니다
  // 다음은 이 컴포넌트에서 Music3.mp3를 임시로 재생하는 코드입니다
  // useEffect(() => {
  //   const audioElement = new Audio('/Music/Music3.mp3');
  //   audioElement.loop = true;
  //   audioElement.volume = 0.3; // 볼륨 설정
    
  //   // 기존 음악 일시 중지
  //   if (currentTrack) {
  //     setPlaying(false);
  //   }
    
  //   // Music3 재생
  //   audioElement.play()
  //     .then(() => {
  //       console.log('Music3.mp3 재생 시작');
  //     })
  //     .catch(error => {
  //       console.error('Music3.mp3 재생 실패:', error);
  //     });
    
  //   // 컴포넌트 언마운트 시 정리
  //   return () => {
  //     audioElement.pause();
  //     audioElement.currentTime = 0;
      
  //     // 다시 원래 음악으로 돌아갈 수 있도록 설정
  //     if (currentTrack) {
  //       setPlaying(true);
  //     }
  //   };
  // }, []);
  
  // 예시 데이터로 초기화 (실제로는 API에서 가져올 것입니다)
  useEffect(() => {
    // 예시 플레이어 데이터
    const dummyPlayers: Player[] = [
      { id: '1', nickname: '방장닉네임', isReady: true, isHost: true, character: 'https://placehold.co/400/orange/white?text=방장' },
      { id: '2', nickname: '플레이어2', isReady: true, isHost: false, character: 'https://placehold.co/400/pink/white?text=플레이어2' },
      { id: '3', nickname: '플레이어3', isReady: true, isHost: false, character: 'https://placehold.co/400/skyblue/white?text=플레이어3' },
      { id: '4', nickname: '내닉네임', isReady: false, isHost: false, character: 'https://placehold.co/400/green/white?text=나' },
    ];
    
    setPlayers(dummyPlayers);
    
    // 현재 사용자 설정 (예시에서는 4번째 플레이어가 '나'라고 가정)
    setCurrentUser(dummyPlayers[2]);
    
    // 예시 채팅 메시지
    setChatMessages([
      '방장님: 안녕하세요! 게임 시작 전 잠시 기다려주세요.',
      '플레이어2: 넵 준비 완료했습니다!',
      '플레이어3: 저도 준비됐어요~',
      '시스템: 플레이어3이 준비를 완료했습니다.',
    ]);
  }, []);
  
  // 채팅 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    // 지연 시간을 두어 DOM이 업데이트된 후 스크롤 적용
    const scrollTimer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
    
    return () => clearTimeout(scrollTimer);
  }, [chatMessages]);
  
  // 모든 플레이어가 준비 상태인지 확인
  const allPlayersReady = players.every(player => player.isHost || player.isReady);
  
  // 준비 상태 토글
  const toggleReady = () => {
    if (!currentUser) return;
    
    setPlayers(prev => prev.map(player => 
      player.id === currentUser.id 
        ? { ...player, isReady: !player.isReady } 
        : player
    ));
    
    setCurrentUser(prev => prev ? { ...prev, isReady: !prev.isReady } : null);
    
    // 채팅에 메시지 추가
    const readyStatus = currentUser.isReady ? '준비 취소' : '준비 완료';
    const newMessage = `시스템: ${currentUser.nickname}님이 ${readyStatus}했습니다.`;
    setChatMessages(prev => [...prev, newMessage]);
  };
  
  // 게임 시작
  const startGame = () => {
    if (!allPlayersReady) {
      alert('모든 플레이어가 준비 상태여야 게임을 시작할 수 있습니다.');
      return;
    }
    
    alert('게임을 시작합니다!');
    navigate('/game');
  };
  
  // 방 나가기
  const leaveRoom = () => {
    if (confirm('정말로 방을 나가시겠습니까?')) {
      navigate('/');
    }
  };
  
  // 채팅 전송
  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    
    const newMessage = `${currentUser.nickname}: ${chatInput}`;
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };
  
  // 고정된 플레이어 슬롯 배열 (최대 4명)
  const playerSlots = Array(4).fill(null);
  players.forEach((player, index) => {
    if (index < 4) {
      playerSlots[index] = player;
    }
  });

 return (
  <div className="relative w-full min-h-screen bg-amber-50">
    {/* 게임 설명 모달 - 최상위 z-index로 설정 */}
    {showInstructionModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-50">
          <GameInstructionModal 
            onClose={closeInstructionModal} 
            onDontShowAgain={setDontShowAgain}
          />
        </div>
      </div>
    )}
    
    {/* 배경 이미지 - fixed 속성 추가 및 배경 처리 */}
    <div className="fixed inset-0 w-full h-full z-0">
      <img 
        className="w-full h-full object-cover"
        src="/images/chicken-background.jpg" 
        alt="닭장 배경"
      />
      {/* 배경 이미지 아래 그라데이션 추가 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-800/30"></div>
    </div>
    
    {/* 컨텐츠 컨테이너 - 스크롤 허용으로 변경 */}
    <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto p-4 sm:p-6">
      {/* 방 정보 헤더 - 나무 판자 스타일로 변경 */}
      <div className="flex justify-between items-center mb-6 z-20">
        {/* 방 이름 나무 판자 */}
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
                {roomName} <span className="mt-1 text-xs sm:text-sm text-amber-200">방 ID: {roomId || '12345'}</span>
              </h1>
              
            </div>
            
            {/* 나무 판자 못 효과 */}
            <div className="absolute -top-2 -left-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
            <div className="absolute -bottom-2 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
          </div>
        </div>
        
        {/* 버튼 그룹 */}
        <div className="flex space-x-2">
          {/* 게임 설명 버튼 */}
          <button 
            onClick={handleShowInstructions}
            className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-blue-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
          >
            게임 설명
          </button>
          
          {/* 방 나가기 버튼 */}
          <button 
            onClick={leaveRoom}
            className="px-1 sm:px-2 md:px-4 py-1 md:py-2 bg-red-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
          >
            방 나가기
          </button>
        </div>
      </div>
      
      {/* 플레이어 슬롯 컨테이너 - 높이 조정 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 flex-grow min-h-0">
        {playerSlots.map((player, index) => (
          <div 
            key={index}
            className="flex flex-col items-center bg-amber-400 rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-2 sm:p-4 relative h-full"
          >
            {player ? (
              <>
                {/* 플레이어 정보 */}
                <div className="w-full h-full flex flex-col items-center justify-between">
                  {/* 캐릭터 이미지 컨테이너 */}
                  <div className="relative w-full flex-grow flex items-center justify-center mb-1 sm:mb-2">
                    {/* 방장 왕관 표시 */}
                    {player.isHost && (
                      <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)] z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L9 9H2L7 14.5L5 22L12 17.5L19 22L17 14.5L22 9H15L12 1Z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* 캐릭터 이미지 */}
                    <div className="relative w-full aspect-square">
                      <img 
                        src={player.character || "https://placehold.co/400x400"} 
                        alt={`${player.nickname} 캐릭터`}
                        className="w-full h-full object-cover rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black"
                      />
                      
                      {/* READY 오버레이 */}
                      {player.isReady && !player.isHost && (
                        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center">
                          <div className="text-red-600 text-xl sm:text-3xl md:text-5xl font-black font-['Press_Start_2P'] filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">READY</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 닉네임 - 텍스트 크기 더 줄이기 */}
                  <div className="w-full mt-1">
                    <div className="text-black text-2xl sm:text-xl md:text-2xl  font-bold font-['Press_Start_2P'] text-center truncate">
                      {player.nickname}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // 빈 슬롯
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-amber-700 text-xs sm:text-sm md:text-lg lg:text-xl font-bold font-['Press_Start_2P']">빈 자리</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 하단 영역 (채팅 및 버튼) - 고정 높이 설정 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* 채팅 영역 */}
        <div className="w-full sm:w-2/3 bg-white rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-black p-3 sm:p-4 flex flex-col h-64 sm:h-72">
          <div 
            ref={chatContainerRef}
            className="h-full overflow-y-auto mb-2 p-2 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-amber-200"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="space-y-2">
              {chatMessages.map((message, index) => (
                <div key={index} className="p-2 rounded">
                  <p className="break-words text-sm sm:text-base">{message}</p>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={sendChat} className="flex mt-auto">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="메시지 입력..."
              className="flex-1 p-2 sm:p-3 border-4 border-black rounded-l-lg focus:outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-amber-400 text-black px-3 sm:px-4 py-2 font-bold border-y-4 border-r-4 border-black rounded-r-lg hover:bg-amber-500 text-sm sm:text-base"
            >
              전송
            </button>
          </form>
        </div>
        
        {/* 버튼 영역 */}
        <div className="w-full sm:w-1/3 flex flex-col justify-center items-center">
          {currentUser?.isHost ? (
            <button
              onClick={startGame}
              disabled={!allPlayersReady}
              className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
                allPlayersReady 
                  ? 'bg-[#ffd62e]' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              시작
            </button>
          ) : (
            <button
              onClick={toggleReady}
              className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
                currentUser?.isReady 
                  ? 'bg-red-500 text-white' 
                  : 'bg-[#ffd62e] text-black'
              }`}
            >
              {currentUser?.isReady ? '취소' : '준비'}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default GameWaitingRoom;