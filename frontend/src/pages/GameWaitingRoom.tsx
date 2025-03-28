import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext'
import { useAuth } from '../contexts/AuthContext';
import { sendReadyStatusMessage, sendGameStartMessage, sendLeaveRoomMessage } from '../utils/GameSocketUtils';
import useGameWebSocket from '../hooks/useGameWebSocket';
import GameInstructionModal from '../components/Game/GameInstructionModal';
import PlayerSlot from '../components/Game/PlayerSlot';
import GameRoomHeader from '../components/Game/GameRoomHeader';
import ChatArea from '../components/Game/ChatArea';
import ReadyButton from '../components/Game/ReadyButton';

const GameWaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: paramRoomCode } = useParams(); // URL 파라미터를 roomCode로 취급
  const [actualRoomId, setActualRoomId] = useState<string | null>(null); // 실제 웹소켓 연결용 ID
  const [displayRoomCode, setDisplayRoomCode] = useState<string | null>(null); // 화면에 표시할 방 코드
  const [roomName, setRoomName] = useState<string>('즐거운 게임방');
  const [chatInput, setChatInput] = useState<string>('');
  const [showInstructionModal, setShowInstructionModal] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // MusicContext 가져오기
  const { setPlaying } = useMusic();
  
  // 웹소켓 커스텀 훅 사용
  const {
    stompClient,
    isConnected,
    players,
    currentUser,
    chatMessages,
    setChatMessages,
    isLeaving,
    setIsLeaving
  } = useGameWebSocket({
    roomId: actualRoomId || '',
    user,
    isAuthenticated,
    isLoading
  });

  // 실제 사용할 roomId 결정
  useEffect(() => {
    // roomId 확인 로깅
    console.log('URL에서 가져온 roomId:', paramRoomCode);
    
    // state에서 전달된 추가 정보 확인
    const stateRoomId = location.state?.roomId;
    const stateRoomCode = location.state?.roomCode;
    
    console.log('state에서 전달된 roomId:', stateRoomId);
    console.log('state에서 전달된 roomCode:', stateRoomCode);
    
    // 로컬 스토리지에서도 확인
    const storedRoomId = localStorage.getItem('roomId'); // 웹소켓용 ID
    const storedRoomCode = localStorage.getItem('roomCode'); // 표시용 코드
    
    console.log('저장된 웹소켓용 roomId:', storedRoomId);
    console.log('저장된 표시용 roomCode:', storedRoomCode);
    
    // 방 정보 설정
    if (location.state?.roomTitle) {
      setRoomName(location.state.roomTitle);
    }
    
    // 실제 사용할 roomId 결정
    const roomIdToUse = stateRoomId || storedRoomId;
    
    // 화면에 표시할 roomCode 결정 (우선순위: URL 파라미터 > state > localStorage)
    const roomCodeToDisplay = paramRoomCode || stateRoomCode || storedRoomCode;
    
    setActualRoomId(roomIdToUse);
    setDisplayRoomCode(roomCodeToDisplay);
    
    console.log('실제 사용할 웹소켓용 roomId:', roomIdToUse);
    console.log('화면에 표시할 roomCode:', roomCodeToDisplay);
    
    // roomId가 없는 경우 경고
    if (!roomIdToUse) {
      console.warn('웹소켓 연결용 roomId를 찾을 수 없습니다.');
    }
  }, [paramRoomCode, location.state]);
  
  // 컴포넌트 마운트 시 '다시 보지 않기' 설정 확인 후 모달 표시
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

  // 로그인 상태 확인 (새로고침 문제 해결을 위한 추가 로직)
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      // 로그인 상태 확인
      if (!isAuthenticated || !user) {
        console.log('세션 정보 확인 중...');
        
        // 토큰 확인
        const token = getAuthToken();
        
        if (!token) {
          console.error('인증 토큰이 없습니다. 로그인 페이지로 이동합니다.');
          alert('로그인이 필요합니다.');
          navigate('/');
          return;
        }
        
        try {
          // 토큰이 있으면 사용자 정보 가져오기 시도
          const storedUser = localStorage.getItem('user');
          
          if (!storedUser) {
            // 로컬 스토리지에 사용자 정보가 없으면 메인으로 리다이렉트
            console.error('사용자 정보가 없습니다. 로그인 페이지로 이동합니다.');
            alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('인증 상태 확인 중 오류:', error);
          navigate('/');
          return;
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, [isAuthenticated, user, navigate]);
  
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
  
  // 모든 플레이어가 준비 상태인지 확인
  const allPlayersReady = players.every(player => player.isHost || player.isReady);
  
  // 준비 상태 토글 - 웹소켓 메시지 전송
  const toggleReady = () => {
    if (!currentUser || !stompClient || !isConnected || !actualRoomId) return;
    
    const newReadyStatus = !currentUser.isReady;
    
    // 준비 상태 변경 메시지 전송
    sendReadyStatusMessage(stompClient, currentUser.memberId!, newReadyStatus, actualRoomId);
  };
  
  // 게임 시작 - 웹소켓 메시지 전송
  const startGame = () => {
    if (!allPlayersReady || !stompClient || !isConnected || !actualRoomId || !currentUser?.isHost) {
      alert('모든 플레이어가 준비 상태여야 게임을 시작할 수 있습니다.');
      return;
    }
    
    // 게임 시작 메시지 전송
    sendGameStartMessage(stompClient, currentUser.memberId!, actualRoomId);
  };
  
  // 방 나가기 함수
  const leaveRoom = () => {
    if (window.confirm('정말로 방을 나가시겠습니까?')) {
      // 나가기 플래그 설정 - 재연결 방지
      setIsLeaving(true);
      
      // 10ms 지연 후 navigate를 실행하여 상태 변경이 적용되도록 함
      const navigateTimer = setTimeout(() => {
        if (stompClient && isConnected && actualRoomId && currentUser) {
          try {
            // 방 퇴장 메시지 전송
            sendLeaveRoomMessage(
              stompClient, 
              currentUser.memberId!, 
              currentUser.nickname, 
              currentUser.characterUrl || "", 
              actualRoomId
            );
            
            console.log('방 퇴장 메시지 전송 완료');
            
            // 구독 취소 추가
            try {
              stompClient.unsubscribe(`/topic/room/${actualRoomId}`);
              stompClient.unsubscribe(`/topic/room/${actualRoomId}/chat`);
              console.log('구독 취소 완료');
            } catch (error) {
              console.error('구독 취소 중 오류:', error);
            }
            
            // 로컬 스토리지에서 방 정보 제거
            localStorage.removeItem('roomId');
            localStorage.removeItem('roomCode');
            
            // 웹소켓 연결 해제
            stompClient.deactivate();
            
            // 페이지 이동
            navigate('/');
          } catch (error) {
            console.error('방 나가기 중 오류:', error);
            navigate('/');
          }
        } else {
          // 연결이 없는 경우 바로 페이지 이동
          localStorage.removeItem('roomId');
          localStorage.removeItem('roomCode');
          navigate('/');
        }
      }, 10);
      
      // 컴포넌트 언마운트 시 타이머 정리를 위해 반환
      return () => clearTimeout(navigateTimer);
    }
  };
  
  // 쿠키에서 토큰 가져오기 함수
  const getAuthToken = () => {
    // 1. 먼저 쿠키에서 확인
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('auth_token=')) {
        return cookie.substring('auth_token='.length);
      }
    }
    
    // 2. 쿠키에 없으면 로컬 스토리지에서 가져옴
    return localStorage.getItem('token');
  };
  
  // 채팅 입력 핸들러
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };
  
  // 채팅 전송 핸들러 (옵션)
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    // 채팅 기능이 활성화되면 구현
  };
  
  // 고정된 플레이어 슬롯 배열 (최대 4명)
  const playerSlots = Array(4).fill(null);
  players.forEach((player, index) => {
    if (index < 4) {
      playerSlots[index] = player;
    }
  });

  // 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-amber-50">
        <div className="text-2xl font-bold">로딩 중...</div>
      </div>
    );
  }

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
        {/* 방 정보 헤더 */}
        <GameRoomHeader 
          roomName={roomName}
          displayRoomCode={displayRoomCode}
          isConnected={isConnected}
          onShowInstructions={handleShowInstructions}
          onLeaveRoom={leaveRoom}
        />
        
        {/* 플레이어 슬롯 컨테이너 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 flex-grow min-h-0">
          {playerSlots.map((player, index) => (
            <PlayerSlot key={index} player={player} index={index} />
          ))}
        </div>
        
        {/* 하단 영역 (채팅 및 버튼) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* 채팅 영역 */}
          <div className="w-full sm:w-2/3">
            <ChatArea 
              chatMessages={chatMessages}
              chatInput={chatInput}
              isConnected={isConnected}
              onInputChange={handleChatInputChange}
              onSubmit={handleSendChat}
              chatEnabled={false} // 채팅 기능 비활성화 상태
            />
          </div>
          
          {/* 버튼 영역 */}
          <div className="w-full sm:w-1/3">
            <ReadyButton 
              currentUser={currentUser}
              isConnected={isConnected}
              allPlayersReady={allPlayersReady}
              onToggleReady={toggleReady}
              onStartGame={startGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameWaitingRoom;