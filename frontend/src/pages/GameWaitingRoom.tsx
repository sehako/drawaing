import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMusic } from '../contexts/MusicContext';
import GameInstructionModal from '../components/Game/GameInstructionModal';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../contexts/AuthContext';

// 타입 정의
interface Player {
  id: string;
  memberId?: number;
  nickname: string;
  isReady: boolean;
  isHost: boolean;
  character?: string;
  characterUrl?: string;
}

// 웹소켓 메시지 타입 정의
interface JoinRoomRequest {
  memberId: number;
  nickname: string;
  characterUrl: string;
}

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
  const { loginAsGuest, isAuthenticated, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  

  // 웹소켓 관련 상태
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
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

  // 로그인 상태 확인 (새로고침 문제 해결을 위한 추가 로직)
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      // 1. 로그인 상태 확인
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
          
          // 사용자 정보가 있으면 이 페이지에서 유지 (AuthContext의 useEffect에서 처리됨)
          console.log('로컬 스토리지에서 사용자 정보 복원 시도 중...');
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

  // 웹소켓 연결 설정 부분 추가 보완 - useEffect 내부에 있는 코드
useEffect(() => {
  if (isLoading) return; // 로딩 중이면 실행하지 않음
  
  // 로그인 상태 다시 확인
  if (!isAuthenticated && !user) {
    console.error('로그인되지 않았습니다. 게임에 참가하려면 로그인이 필요합니다.');
    alert('로그인이 필요합니다.');
    navigate('/');
    return;
  }

  // 사용자 정보 가져오기
  const userInfo = {
    memberId: user?.memberId || 0, // 기본값 제공
    nickname: user?.nickname || '게스트', // 기본값 제공
    characterUrl: user?.characterImage || 'default_character'
  };

  console.log('웹소켓 연결 시도 - 사용자 정보:', userInfo); // 디버깅용

  // 기존 연결이 있다면 해제
  let newClient: Client | null = null;
  
  try {
    // 웹소켓 연결 (STOMP)
    newClient = new Client({
      brokerURL: 'wss://www.drawaing.site/service/game/drawing', // 실제 서버 URL
      connectHeaders: {
        // 필요한 인증 헤더
        'Authorization': `Bearer ${getAuthToken()}`
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 시 콜백
    newClient.onConnect = () => {
      setIsConnected(true);
      console.log('WebSocket 연결 성공!');

      // 방 참가 요청
      if (roomId) {
        joinRoom(newClient!, userInfo, roomId);
      }

      // 해당 방의 이벤트를 구독
      subscribeToRoom(newClient!, roomId);
    };

    // 연결 에러 시 콜백
    newClient.onStompError = (frame) => {
      console.error('WebSocket 연결 오류:', frame);
      setIsConnected(false);
    };

    // 연결 끊김 콜백
    newClient.onDisconnect = () => {
      console.log('WebSocket 연결 끊김');
      setIsConnected(false);
      
      // 연결 재시도 (3초 후)
      setTimeout(() => {
        if (newClient && !newClient.active) {
          console.log('WebSocket 연결 재시도...');
          try {
            newClient.activate();
          } catch (error) {
            console.error('WebSocket 재연결 오류:', error);
          }
        }
      }, 3000);
    };

    // 연결 시작
    newClient.activate();
    setStompClient(newClient);
  } catch (error) {
    console.error('WebSocket 초기화 오류:', error);
    if (newClient) {
      try {
        newClient.deactivate();
      } catch (deactivateError) {
        console.error('WebSocket 종료 오류:', deactivateError);
      }
    }
  }

  // 컴포넌트 언마운트 시 연결 해제
  return () => {
    if (newClient) {
      try {
        console.log('WebSocket 연결 종료 중...');
        newClient.deactivate();
      } catch (error) {
        console.error('WebSocket 연결 종료 오류:', error);
      }
    }
  };
}, [roomId, user, isAuthenticated, navigate, isLoading]);

  // 방 참가 함수
const joinRoom = (client: Client, userInfo: JoinRoomRequest, roomId: string | undefined) => {
  if (!roomId) return;
  
  console.log('방 참가 시도 - 사용자 정보:', userInfo, '방 ID:', roomId);
  
  const destination = `/service/game/drawing/app/room.join/${roomId}`;
  const message = {
    memberId: userInfo.memberId,
    nickname: userInfo.nickname,
    characterUrl: userInfo.characterUrl
  };

  // 재시도 메커니즘 추가
  let attemptCount = 0;
  const maxAttempts = 3;
  
  const attemptJoin = () => {
    attemptCount++;
    console.log(`방 참가 시도 ${attemptCount}/${maxAttempts}`);
    
    client.publish({
      destination: destination,
      body: JSON.stringify(message),
      headers: { 
        'content-type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}` // 인증 토큰 추가
      }
    });
    
    // 응답이 없으면 재시도 (최대 3회)
    if (attemptCount < maxAttempts) {
      setTimeout(() => {
        // 플레이어 목록이 비어있는지 확인
        if (players.length === 0) {
          attemptJoin();
        }
      }, 1000); // 1초 후 재시도
    }
  };
  
  // 첫 번째 시도 시작
  attemptJoin();
  
  console.log(`방 참가 요청을 보냈습니다: ${destination}`, message);
  
  // 방 생성자인 경우, 방장 설정을 강제로 시도
  if (roomId && userInfo.memberId) {
    // 임시 데이터로 자신을 방장으로 설정
    setTimeout(() => {
      if (players.length === 0) {
        const tempPlayerData = {
          [userInfo.memberId]: {
            nickname: userInfo.nickname,
            characterUrl: userInfo.characterUrl,
            ready: false
          }
        };
        console.log('임시 플레이어 데이터 생성:', tempPlayerData);
        updatePlayersList(tempPlayerData);
      }
    }, 2000); // 2초 후 확인
  }
};
  // 방 이벤트 구독 함수
const subscribeToRoom = (client: Client, roomId: string | undefined) => {
  if (!roomId) return;

  // 단일 엔드포인트에서 모든 이벤트 구독
  client.subscribe(`/service/game/drawing/topic/room/${roomId}`, (message) => {
    try {
      const data = JSON.parse(message.body);
      console.log('방 이벤트 데이터:', data);
      
      // 데이터 형식에 따라 적절한 핸들러 호출
      // 플레이어 데이터가 포함된 경우
      if (data && Object.keys(data).length > 0 && 
          Object.values(data).some((player: any) => 
            player && (player.nickname !== undefined || player.characterUrl !== undefined || player.ready !== undefined)
          )) {
        console.log('플레이어 정보 업데이트 감지');
        updatePlayersList(data);
      }
      
      // 게임 시작 메시지인 경우 (추가 처리 필요시)
      // 채팅 메시지인 경우 (추가 처리 필요시)
      
    } catch (error) {
      console.error('이벤트 데이터 파싱 오류:', error);
    }
  });
};

  // 플레이어 목록 업데이트 함수
const updatePlayersList = (playerData: any) => {
  console.log('플레이어 데이터 원본:', playerData);
  
  // 방을 만든 사람이거나 첫번째로 입장한 사람을 방장으로 설정
  const playerIds = Object.keys(playerData);
  const firstPlayerId = playerIds.length > 0 ? playerIds[0] : null;
  
  // 객체를 배열로 변환하여 처리
  const updatedPlayers = Object.entries(playerData).map(([id, data]: [string, any]) => {
    // 방장 설정: 첫 번째 ID를 가진 사람을 방장으로
    const isHost = id === firstPlayerId;
    
    return {
      id: id,
      memberId: parseInt(id),
      nickname: data.nickname || '알 수 없음',
      isReady: data.ready || false,  // 서버에서는 ready로 전송됨
      isHost: isHost,
      character: data.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown',
      characterUrl: data.characterUrl || 'https://placehold.co/400/gray/white?text=Unknown'
    };
  });

  console.log('업데이트된 플레이어 목록:', updatedPlayers);
  setPlayers(updatedPlayers);

  // 현재 사용자 찾기
  if (user && user.memberId) {
    const userIdStr = user.memberId.toString();
    // 내가 방장인지 확인
    const amIHost = userIdStr === firstPlayerId;
    
    const myInfo = updatedPlayers.find(p => p.id === userIdStr || p.memberId === user.memberId);
    if (myInfo) {
      // 방장 상태를 명확하게 설정
      const updatedMyInfo = {...myInfo, isHost: amIHost};
      console.log('현재 사용자 정보 업데이트:', updatedMyInfo);
      setCurrentUser(updatedMyInfo);
    } else {
      // 사용자가 목록에 없으면, 기존 user 정보로 가상의 플레이어 객체 생성
      const virtualUser = {
        id: userIdStr,
        memberId: user.memberId,
        nickname: user.nickname || '게스트',
        isReady: false,
        isHost: amIHost,  // 내가 첫 번째 ID라면 방장
        character: user.characterImage || 'https://placehold.co/400/gray/white?text=Unknown',
        characterUrl: user.characterImage || 'https://placehold.co/400/gray/white?text=Unknown'
      };
      console.log('가상 사용자 정보 생성:', virtualUser);
      setCurrentUser(virtualUser);
      
      // 플레이어 목록에 자신 추가(서버 응답에 본인이 없는 경우를 대비)
      setPlayers(prev => [...prev, virtualUser]);
    }
  }
  
  // 개발용 로그: 방장 정보 확인
  const host = updatedPlayers.find(p => p.isHost);
  console.log('방장 정보:', host);
};

  // 채팅 메시지 추가 함수
  const addChatMessage = (chatData: any) => {
    // API 응답 형식에 맞게 구현 필요
    const newMessage = `${chatData.nickname}: ${chatData.message}`;
    setChatMessages(prev => [...prev, newMessage]);
  };

  // 준비 상태 업데이트 함수
const updatePlayerReadyStatus = (readyData: any) => {
  console.log('준비 상태 변경 데이터:', readyData);
  
  // readyData 형식이 { playerId: { ready: boolean } } 형태인 경우
  if (typeof readyData === 'object' && !Array.isArray(readyData)) {
    const entries = Object.entries(readyData);
    if (entries.length > 0) {
      const [playerId, playerData] = entries[0] as [string, any];
      
      // 플레이어 목록 업데이트
      setPlayers(prev => prev.map(player => 
        player.id === playerId
          ? { ...player, isReady: playerData.ready }
          : player
      ));

      // 현재 사용자의 준비 상태 업데이트
      if (currentUser && currentUser.id === playerId) {
        setCurrentUser(prev => prev ? { ...prev, isReady: playerData.ready } : null);
      }

      // 채팅에 메시지 추가
      const playerName = players.find(p => p.id === playerId)?.nickname || 'Unknown';
      const readyStatus = playerData.ready ? '준비 완료' : '준비 취소';
      const newMessage = `시스템: ${playerName}님이 ${readyStatus}했습니다.`;
      setChatMessages(prev => [...prev, newMessage]);
    }
  } else {
    console.error('예상치 못한 준비 상태 데이터 형식:', readyData);
  }
};

  // 게임 시작 처리 함수
  const handleGameStart = () => {
    // 게임 페이지로 이동
    navigate('/game');
  };
  
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
  
  // 준비 상태 토글 - 웹소켓 메시지 전송
  const toggleReady = () => {
    if (!currentUser || !stompClient || !isConnected || !roomId) return;
    
    const newReadyStatus = !currentUser.isReady;
    
    // 준비 상태 변경 메시지 전송
    stompClient.publish({
      destination: `wss://www.drawaing.site/service/game/drawing/app/room.ready/${roomId}`,
      body: JSON.stringify({
        memberId: currentUser.memberId,
        isReady: newReadyStatus
      }),
      headers: { 
        'content-type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}` // 인증 토큰 추가
      }
    });
  };
  
  // 게임 시작 - 웹소켓 메시지 전송
  const startGame = () => {
    if (!allPlayersReady || !stompClient || !isConnected || !roomId || !currentUser?.isHost) {
      alert('모든 플레이어가 준비 상태여야 게임을 시작할 수 있습니다.');
      return;
    }
    
    // 게임 시작 메시지 전송
    stompClient.publish({
      destination: `wss://www.drawaing.site/service/game/drawing/app/room.start/${roomId}`,
      body: JSON.stringify({
        memberId: currentUser.memberId
      }),
      headers: { 
        'content-type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}` // 인증 토큰 추가
      }
    });
  };
  
  const leaveRoom = () => {
    if (confirm('정말로 방을 나가시겠습니까?')) {
      if (stompClient && isConnected && roomId && currentUser) {
        try {
          // 방 퇴장 메시지 전송
          stompClient.publish({
            destination: `/app/room.leave/${roomId}`,
            body: JSON.stringify({
              memberId: currentUser.memberId,
              nick: currentUser.nickname,
              characterUrl: currentUser.characterUrl || "https://example.com/default-character.png"
            }),
            headers: { 
              'content-type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}` 
            }
          });
          
          // 웹소켓 연결 완전히 해제
          stompClient.deactivate().then(() => {
            console.log('웹소켓 연결 해제 완료');
            
            // 상태 초기화
            setIsConnected(false);
            setRoomId(null);
            setCurrentUser(null);
            
            // 페이지 이동
            navigate('/');
          }).catch((error) => {
            console.error('웹소켓 연결 해제 중 오류:', error);
            // 강제로 페이지 이동
            navigate('/');
          });
        } catch (error) {
          console.error('방 나가기 중 오류:', error);
          navigate('/');
        }
      } else {
        // 연결이 없는 경우 바로 페이지 이동
        navigate('/');
      }
    }
  };
  
  // 채팅 전송
  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser || !stompClient || !isConnected || !roomId) return;
    
    // 채팅 메시지 전송
    stompClient.publish({
      destination: `/service/game/drawing/topic/room/${roomId}/chat`,
      body: JSON.stringify({
        memberId: currentUser.memberId,
        nickname: currentUser.nickname,
        message: chatInput
      }),
      headers: { 
        'content-type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}` // 인증 토큰 추가
      }
    });
    
    setChatInput('');
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
          
          {/* 연결 상태 표시 */}
          <div className={`absolute -top-4 right-4 px-2 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {isConnected ? '연결됨' : '연결 중...'}
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
                          src={player.character || player.characterUrl || "https://placehold.co/400x400"} 
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
                disabled={!isConnected}
              />
              <button
                type="submit"
                className={`${isConnected ? 'bg-amber-400 hover:bg-amber-500' : 'bg-gray-400'} text-black px-3 sm:px-4 py-2 font-bold border-y-4 border-r-4 border-black rounded-r-lg text-sm sm:text-base`}
                disabled={!isConnected}
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
                disabled={!allPlayersReady || !isConnected}
                className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
                  allPlayersReady && isConnected
                    ? 'bg-[#ffd62e]' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                시작
              </button>
            ) : (
              <button
                onClick={toggleReady}
                disabled={!isConnected}
                className={`w-full h-16 sm:h-24 rounded-full flex items-center justify-center border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 text-2xl sm:text-4xl font-bold font-['Press_Start_2P'] transition-all duration-200 ${
                  !isConnected
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : currentUser?.isReady 
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