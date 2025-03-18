import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    setCurrentUser(dummyPlayers[3]);
    
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
    // navigate('/game/play');
  };
  
  // 방 나가기
  const leaveRoom = () => {
    if (confirm('정말로 방을 나가시겠습니까?')) {
      navigate('/lobby');
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
    <div className="relative w-full h-screen overflow-hidden bg-amber-50">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          className="w-full h-full object-cover"
          src="/images/chicken-background.jpg" 
          alt="닭장 배경"
        />
      </div>
      
      {/* 컨텐츠 컨테이너 */}
      <div className="relative z-10 flex flex-col h-full p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto overflow-hidden">
        {/* 방 정보 헤더 */}
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Press_Start_2P'] text-black">{roomName}</h1>
            <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-gray-600">방 ID: {roomId || '12345'}</span>
          </div>
          <button 
            onClick={leaveRoom}
            className="px-2 sm:px-4 py-1 sm:py-2 bg-red-500 rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-white text-sm sm:text-base font-bold transition-all duration-200"
          >
            방 나가기
          </button>
        </div>
        
        {/* 플레이어 슬롯 컨테이너 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-2 sm:mb-4 h-[calc(100%-220px)] min-h-[200px]">
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
                    
                    {/* 닉네임과 방장 표시를 하단에 배치 */}
                    <div className="w-full mt-auto">
                      {/* 닉네임 표시 */}
                      <div className="text-black text-sm sm:text-base md:text-xl font-bold mb-1 sm:mb-2 font-['Press_Start_2P'] text-center truncate">
                        {player.nickname}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // 빈 슬롯
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-amber-700 text-sm sm:text-lg md:text-xl font-bold font-['Press_Start_2P']">빈 자리</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 하단 영역 (채팅 및 버튼) */}
        <div className="flex gap-3 sm:gap-6 h-48 sm:h-64">
          {/* 채팅 영역 */}
          <div className="w-2/3 bg-white rounded-3xl border-8 border-black p-4 flex flex-col">
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
          <div className="w-1/3 flex flex-col justify-center items-center">
            {currentUser?.isHost ? (
              <button
                onClick={startGame}
                disabled={!allPlayersReady}
                className={`w-full h-full rounded-full flex items-center justify-center border-4 border-black text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] ${
                  allPlayersReady 
                    ? 'bg-[#ffd62e] shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200' 
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