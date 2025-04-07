import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext'
import { useAuth } from '../contexts/AuthContext';
import { sendReadyStatusMessage, sendGameStartMessage, sendLeaveRoomMessage } from '../utils/GameSocketUtils';
import useUserWebSocket from '../hooks/useUserWebSocket';
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
  const [localReady, setLocalReady] = useState<boolean>(false);
  const [userChangedReady, setUserChangedReady] = useState<boolean>(false);
  // 게임 입장 중 상태 추가 (컴포넌트 상단에 추가)
  const [isEnteringGame, setIsEnteringGame] = useState<boolean>(false);
  // 게임 시작 카운트다운 상태 추가
  const [gameStartCountdown, setGameStartCountdown] = useState<number | null>(null);
  
  // 방장 상태 관리 개선
  const [isLocalHost, setIsLocalHost] = useState<boolean>(location.state?.isHost || false);

  // MusicContext 가져오기
  const { setPlaying } = useMusic();
  
  // 웹소켓 커스텀 훅 사용
  const {
    stompClient,
    isConnected,
    players,
    currentUser,
    chatMessages,
    gameStartInfo,
    setGameStartInfo,
    sessionId, // 세션 ID 추가
    setChatMessages,
    isLeaving,
    setIsLeaving
  } = useUserWebSocket({
    roomId: actualRoomId || '',
    user,
    isAuthenticated,
    isLoading
  });
  useEffect(() => {
    if (currentUser) {
      // currentUser를 JSON 문자열로 변환하여 로컬 스토리지에 저장
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      console.log('currentUser가 로컬 스토리지에 저장되었습니다:', currentUser);
    }
  }, [currentUser]); // currentUser가 변경될 때마다 실행

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log("==== 실시간 상태 확인 로그 ====");
    console.log("현재 플레이어:", currentUser);
    console.log("isLocalHost 상태:", isLocalHost);
    console.log("플레이어 목록:", players);
    console.log("연결 상태:", isConnected);
    console.log("게임 시작 정보:", gameStartInfo);
  }, [currentUser, isLocalHost, players, isConnected, gameStartInfo]);


  // 디버깅용 useEffect 추가 (gameStartInfo 상태 추적)
  useEffect(() => {
    console.error('=== gameStartInfo 변경 감지 ===');
    console.error('gameStartInfo:', gameStartInfo);
    console.error('actualRoomId:', actualRoomId);
    console.error('isConnected:', isConnected);
    console.error('stompClient:', !!stompClient);
  }, [gameStartInfo, actualRoomId, isConnected, stompClient]);


  // 디버깅용 useEffect 추가 (gameStartInfo 상태 추적)
  useEffect(() => {
    console.error('=== gameStartInfo 변경 감지 ===');
    console.error('gameStartInfo:', gameStartInfo);
    console.error('actualRoomId:', actualRoomId);
    console.error('isConnected:', isConnected);
    console.error('stompClient:', !!stompClient);
  }, [gameStartInfo, actualRoomId, isConnected, stompClient]);

  useEffect(() => {
    // gameStartInfo가 변경되면 isEnteringGame 상태도 업데이트
    if (gameStartInfo) {
      console.log('gameStartInfo 변경 감지:', gameStartInfo);
      // isEntering 값에 따라 isEnteringGame 상태 설정
      setIsEnteringGame(gameStartInfo.isEntering || false);
    }
  }, [gameStartInfo]);
  
  // 게임 시작 정보가 업데이트되면 카운트다운 시작
  useEffect(() => {
    // 게임 시작 정보나 방 ID가 없으면 즉시 종료
    if (!gameStartInfo || !actualRoomId) {
      console.warn('게임 시작 정보 없음:', { 
        gameStartInfo, 
        actualRoomId,
        gameStartInfoType: typeof gameStartInfo,
        gameStartInfoKeys: gameStartInfo ? Object.keys(gameStartInfo) : 'N/A'
      });
      return;
    }
    
    console.log('게임 시작 정보 전체 데이터:', gameStartInfo);
  
    
    // 서버에서 받은 시작 시간 파싱
  const startTime = new Date(gameStartInfo.startTime);
  const currentTime = new Date();
  const timeUntilStart = startTime.getTime() - currentTime.getTime();
  
  console.log('서버 시작 시간:', startTime.toISOString());
  console.log('현재 시간:', currentTime.toISOString());
  console.log(`게임 시작까지 ${timeUntilStart}ms (${timeUntilStart/1000}초) 남음`);
    // 이미 시작 시간이 지났거나 음수인 경우 즉시 게임 화면으로 이동
  if (timeUntilStart <= 0) {
    console.log('시작 시간이 이미 지났거나 현재임 - 즉시 게임 화면으로 이동');
    navigate(`/game/${actualRoomId}`);
    return;
  }
  
  // 초 단위로 카운트다운 설정 (올림 처리)
  const initialCountdown = Math.ceil(timeUntilStart / 1000);
  setGameStartCountdown(initialCountdown);
  
  // 정확한 초 단위 카운트다운을 위한 타이머
  let remainingSeconds = initialCountdown;
  
  // 1초마다 카운트다운 업데이트
  const countdownInterval = setInterval(() => {
    remainingSeconds -= 1;
    
    if (remainingSeconds <= 0) {
      // 카운트다운이 끝나면 타이머 정리 및 게임 화면으로 이동
      clearInterval(countdownInterval);
      navigate(`/game/${actualRoomId}`);
    } else {
      // 아직 카운트다운 중이면 상태 업데이트
      setGameStartCountdown(remainingSeconds);
    }
  }, 1000);
  
  // 정확한 시작 시간에 게임 화면으로 이동하는 백업 타이머
  const exactStartTimer = setTimeout(() => {
    clearInterval(countdownInterval);
    console.log('정확한 시작 시간에 도달 - 게임 화면으로 이동');
    navigate(`/game/${actualRoomId}`);
  }, timeUntilStart);
  
  // 컴포넌트 언마운트 시 타이머 정리
  return () => {
    clearInterval(countdownInterval);
    clearTimeout(exactStartTimer);
  };
}, [gameStartInfo, actualRoomId, navigate]);


  // 실제 사용할 roomId 결정
  useEffect(() => {
    // roomId 확인 로깅
    console.log('URL에서 가져온 roomId:', paramRoomCode);
    
    // state에서 전달된 추가 정보 확인
    const stateRoomId = location.state?.roomId;
    const stateRoomCode = location.state?.roomCode;
    const stateIsHost = location.state?.isHost === true;
    
    console.log('state에서 전달된 roomId:', stateRoomId);
    console.log('state에서 전달된 roomCode:', stateRoomCode);
    console.log('state에서 전달된 isHost:', stateIsHost);
    
    // 방장 여부 설정
    if (stateIsHost) {
      console.log('state에서 방장 정보 확인: 방장임');
      setIsLocalHost(true);
      localStorage.setItem('isHost', 'true');
    }
    
    // 로컬 스토리지에서도 확인
    const storedRoomId = localStorage.getItem('roomId'); // 웹소켓용 ID
    const storedRoomCode = localStorage.getItem('roomCode'); // 표시용 코드
    const storedIsHost = localStorage.getItem('isHost') === 'true';
    
    console.log('저장된 웹소켓용 roomId:', storedRoomId);
    console.log('저장된 표시용 roomCode:', storedRoomCode);
    console.log('저장된 isHost:', storedIsHost);
    
    // 방장 정보 로컬 스토리지에서 가져오기
    if (storedIsHost && !stateIsHost) {
      console.log('로컬 스토리지에서 방장 정보 확인: 방장임');
      setIsLocalHost(true);
    }
    
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
  
  // currentUser가 업데이트되면 방장 여부 확인
  useEffect(() => {
    if (currentUser) {
      console.log('currentUser 업데이트 감지:', currentUser);
      console.log('currentUser.isHost 값:', currentUser.isHost);
      
      // 서버로부터 받은 isHost 값이 true인 경우 로컬 상태 및 스토리지 업데이트
      if (currentUser.isHost === true) {
        console.log('서버에서 방장으로 지정됨');
        setIsLocalHost(true);
        localStorage.setItem('isHost', 'true');
      }
      // 서버로부터 받은 isHost 값이 명확하게 false인 경우만 업데이트
      else if (currentUser.isHost === false) {
        // 로컬 스토리지나 state에서 방장으로 지정된 경우가 아니라면
        const storedIsHost = localStorage.getItem('isHost') === 'true';
        const stateIsHost = location.state?.isHost === true;
        
        if (!storedIsHost && !stateIsHost) {
          console.log('서버, 로컬 스토리지, state 모두에서 방장이 아님');
          setIsLocalHost(false);
          localStorage.setItem('isHost', 'false');
        } else {
          console.log('서버에서는 방장이 아니지만, 로컬 스토리지나 state에서 방장으로 지정됨');
        }
      }
    }
  }, [currentUser, location.state]);
  
  // currentUser가 업데이트되면 localReady도 업데이트
  useEffect(() => {
    if (currentUser && !userChangedReady) {
      setLocalReady(currentUser.isReady);
    }
  }, [currentUser, userChangedReady]);
    
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
  
  // 플레이어 최대 인원
  const MAX_PLAYERS = 4;

  // 모든 플레이어가 준비 상태인지 확인
  const allPlayersReady = players.length >= MAX_PLAYERS && players.filter(player => !player.isHost).every(player => player.isReady);

  
  // 디버깅을 위한 로그 추가
  console.log('현재 플레이어 수:', players.length);
  console.log('모든 플레이어 준비 상태:', allPlayersReady);
  console.log('플레이어 목록:', players);
  console.log('방장 여부(isLocalHost):', isLocalHost);

  // 준비 상태 토글 - 웹소켓 메시지 전송
  const toggleReady = () => {
    if (!currentUser || !stompClient || !isConnected || !actualRoomId) return;
    
    // 게임 시작 카운트다운 중에는 준비 상태 변경 불가
    if (gameStartCountdown !== null) {
      console.log('게임 시작 카운트다운 중에는 준비 상태를 변경할 수 없습니다.');
      return;
    }
    
    // 로컬 상태를 즉시 반영 (UI 즉시 업데이트)
    const newReadyStatus = !localReady;
    setLocalReady(newReadyStatus);
    
    // 사용자가 직접 변경했음을 표시
    setUserChangedReady(true);

    // 준비 상태 변경 메시지 전송
    sendReadyStatusMessage(stompClient, currentUser.memberId!, newReadyStatus, actualRoomId);
  };
  
 // startGame 함수 수정 - 버튼 클릭 시 "게임에 입장 중입니다" 메시지 표시
const startGame = () => {
  if (!isLocalHost || !stompClient || !isConnected || !actualRoomId || !currentUser?.memberId) {
    console.error('게임을 시작할 수 없습니다:', {
      isLocalHost,
      hasStompClient: !!stompClient, 
      isConnected, 
      actualRoomId,
      currentUserMemberId: currentUser?.memberId
    });
    
    if (!allPlayersReady) {
      alert('모든 플레이어가 준비 상태여야 게임을 시작할 수 있습니다.');
    } else {
      alert('게임을 시작할 수 없습니다. 연결 상태를 확인해주세요.');
    }
    return;
  }
  
  // 게임 시작 카운트다운 또는 입장 중 상태에는 시작 버튼 중복 클릭 방지
  if (gameStartCountdown !== null || isEnteringGame) {
    console.log('이미 게임 시작 과정이 진행 중입니다.');
    return;
  }
  
  // // "게임에 입장 중입니다" 상태로 설정
  // setIsEnteringGame(true);
  
  console.log('게임 시작 메시지 전송:', {
    memberId: currentUser.memberId,
    roomId: actualRoomId
  });
  
  // 게임 시작 메시지 전송
  sendGameStartMessage(stompClient, currentUser.memberId, actualRoomId);
  
  // 만약 8초 내에 서버 응답이 없으면 게임 화면으로 강제 이동 (안전장치)
  const fallbackTimer = setTimeout(() => {
    console.log('서버 응답 없음 - 게임 화면으로 강제 이동');
    navigate(`/game/${actualRoomId}`);
  }, 8000);
  
  // 타이머 저장 (컴포넌트 언마운트 시 정리하기 위해)
  localStorage.setItem('fallbackTimerId', fallbackTimer.toString());
};


useEffect(() => {
  // gameStartInfo가 업데이트되면 isEnteringGame 상태 업데이트
  if (gameStartInfo) {
    setIsEnteringGame(gameStartInfo.isEntering || false);
  }
}, [gameStartInfo]);


// 게임 시작 정보 업데이트 처리 useEffect 수정
useEffect(() => {
  // 게임 시작 정보나 방 ID가 없으면 즉시 종료
  if (!gameStartInfo || !actualRoomId) {
    return;
  }
  
  console.log('게임 시작 정보 전체 데이터:', gameStartInfo);
  
  // 서버에서 받은 시작 시간 파싱
  const startTime = new Date(gameStartInfo.startTime);
  const currentTime = new Date();
  const timeUntilStart = startTime.getTime() - currentTime.getTime();
  
  console.log('서버 시작 시간:', startTime.toISOString());
  console.log('현재 시간:', currentTime.toISOString());
  console.log(`게임 시작까지 ${timeUntilStart}ms (${timeUntilStart/1000}초) 남음`);
  
  // 이미 시작 시간이 지났거나 음수인 경우 즉시 게임 화면으로 이동
  if (timeUntilStart <= 0) {
    console.log('시작 시간이 이미 지났거나 현재임 - 즉시 게임 화면으로 이동');
    navigate(`/game/${actualRoomId}`);
    return;
  }
  
  // fallback 타이머 취소 (서버 응답이 왔으므로)
  const fallbackTimerId = localStorage.getItem('fallbackTimerId');
  if (fallbackTimerId) {
    clearTimeout(parseInt(fallbackTimerId));
    localStorage.removeItem('fallbackTimerId');
  }
  
  // 이제 "게임에 입장 중" 상태에서 실제 카운트다운으로 전환
  setIsEnteringGame(false);
  
  // 초 단위로 카운트다운 설정 (올림 처리)
  const initialCountdown = Math.ceil(timeUntilStart / 1000);
  setGameStartCountdown(initialCountdown);
  
  // 정확한 초 단위 카운트다운을 위한 타이머
  let remainingSeconds = initialCountdown;
  
  // 1초마다 카운트다운 업데이트
  const countdownInterval = setInterval(() => {
    remainingSeconds -= 1;
    
    if (remainingSeconds <= 0) {
      // 카운트다운이 끝나면 타이머 정리 및 게임 화면으로 이동
      clearInterval(countdownInterval);
      navigate(`/game/${actualRoomId}`);
    } else {
      // 아직 카운트다운 중이면 상태 업데이트
      setGameStartCountdown(remainingSeconds);
    }
  }, 1000);
  
  // 정확한 시작 시간에 게임 화면으로 이동하는 백업 타이머
  const exactStartTimer = setTimeout(() => {
    clearInterval(countdownInterval);
    console.log('정확한 시작 시간에 도달 - 게임 화면으로 이동');
    navigate(`/game/${actualRoomId}`);
  }, timeUntilStart);
  
  // 컴포넌트 언마운트 시 타이머 정리
  return () => {
    clearInterval(countdownInterval);
    clearTimeout(exactStartTimer);
  };
}, [gameStartInfo, actualRoomId, navigate]);
  
  // 방 나가기 함수
  const leaveRoom = () => {
    // 게임 시작 카운트다운 중에는 방 나가기 불가
    if (gameStartCountdown !== null) {
      alert('게임 시작 카운트다운 중에는 방을 나갈 수 없습니다.');
      return;
    }
    
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
              stompClient.unsubscribe(`/topic/room.wait/${actualRoomId}`); // 새로 추가된 구독 취소
              console.log('구독 취소 완료');
            } catch (error) {
              console.error('구독 취소 중 오류:', error);
            }
            
            // 로컬 스토리지에서 방 정보 제거
            localStorage.removeItem('roomId');
            localStorage.removeItem('roomCode');
            localStorage.removeItem('isHost');
            
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
          localStorage.removeItem('isHost');
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
      {isEnteringGame && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="relative z-50 bg-amber-100 p-8 rounded-xl shadow-2xl border-4 border-amber-500 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-amber-800">게임에 입장 중입니다</h2>
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
      <p className="text-xl text-center">
        잠시만 기다려 주세요...<br />
        모든 플레이어 연결 중
      </p>
    </div>
  </div>
)}

// 기존 카운트다운 모달 유지 (조건문 수정 - isEnteringGame이 아닐 때만 표시)
{!isEnteringGame && gameStartCountdown !== null && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="relative z-50 bg-amber-100 p-8 rounded-xl shadow-2xl border-4 border-amber-500 flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-4 text-amber-800">게임 시작 준비!</h2>
      <div className="text-7xl font-black text-amber-600 mb-4">{gameStartCountdown}</div>
      <p className="text-xl text-center">
        잠시 후 게임이 시작됩니다.<br />
        준비하세요!
      </p>
    </div>
  </div>
)}
      
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
              chatEnabled={true} // 채팅 기능 비활성화 상태
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
              customReadyState={localReady}
              customIsHost={isLocalHost}
              playerCount={players.length}
              maxPlayers={MAX_PLAYERS}
              roomId={actualRoomId || undefined} // null을 undefined로 변환
              // 게임 카운트다운 중에는 버튼 비활성화
              disabled={gameStartCountdown !== null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameWaitingRoom;