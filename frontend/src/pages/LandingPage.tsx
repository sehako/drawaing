import React, { useState, useEffect } from 'react';
import LoginModal from '../components/landing/LoginModal';
import SignupModal from '../components/landing/SignupModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DrawingLogo from '../components/landing/DrawingLogo';

const LandingPage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'roomSelection'>('landing');
  const [roomCode, setRoomCode] = useState('');
  const { loginAsGuest, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  // 애니메이션을 위한 상태 추가
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // 로그인 상태 확인 및 뷰 전환
  useEffect(() => {
    console.log('로그인 상태:', isAuthenticated);
    console.log('사용자 정보:', user);
    
    if (isAuthenticated) {
      setCurrentView('roomSelection');
    }
  }, [isAuthenticated, user]);

  // 페이지 로드 시 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };

  const handleGuestClick = async () => {
    try {
      // 게스트 로그인 로직
      await loginAsGuest();
      setCurrentView('roomSelection');
    } catch (error) {
      console.error('게스트 로그인 오류:', error);
      alert('게스트 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSignupClick = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const handleSuccessfulLogin = () => {
    setCurrentView('roomSelection');
  };

  // 로그아웃 핸들러 추가
  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: string) => {
    try {
      // 여기에 소셜 로그인 API 호출 로직 추가
      alert(`${provider} 로그인을 시도합니다.`);
      
      // 로그인 성공 시 페이지 이동
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      alert(`${provider} 로그인에 실패했습니다. 다시 시도해주세요.`);
    }
  };

  // 방 만들기 핸들러
  const handleCreateRoom = async () => {
    try {
      // 임시 방 코드 생성 로직
      const newRoomId = Math.random().toString(36).substring(7);
      setRoomCode(newRoomId);
      navigate(`/waiting-room/${newRoomId}`);
    } catch (error) {
      console.error('방 생성 중 오류:', error);
      alert('방을 생성하는 데 실패했습니다.');
    }
  };

  // 방 입장 핸들러
  const handleJoinRoom = async (inputRoomCode?: string) => {
    const codeToJoin = inputRoomCode || roomCode;
    if (!codeToJoin) {
      alert('방 코드를 입력해주세요.');
      return;
    }

    try {
      // TODO: 실제 구현 시 방 존재 확인 API 호출
      navigate(`/waiting-room/${codeToJoin}`);
    } catch (error) {
      console.error('방 입장 중 오류:', error);
      alert('방에 입장할 수 없습니다.');
    }
  };

  // ChickenCharacters 컴포넌트 (기존 코드 그대로)
  const ChickenCharacters = () => (
   <div className="relative w-full">
    {/* 왼쪽 상단 화난 닭 - 사선으로 배치 */}
    <div 
      className={`absolute -top-36 -left-24 z-0 transition-all duration-1000 ${
        isPageLoaded 
          ? 'opacity-100 transform translate-y-0 scale-100' 
              : 'opacity-0 transform -translate-y-10 scale-90'
      }`}
      style={{ 
        transitionDelay: '0.2s',
        transform: isPageLoaded ? 'rotate(-15deg)' : 'rotate(-15deg) translateX(-20px)',
      }}
    >
      <img src="/images/angry-chicken.png" alt="화난 닭" className="w-72 h-72" />
    </div>
    
    {/* 상단 중앙 근육 닭 - 약간 로고 뒤쪽으로 이동 */}
    <div 
      className={`absolute top-[-160px]  translate-x-1/2 z-0 transition-all duration-1000 ${
        isPageLoaded 
          ? 'opacity-100 transform translate-y-0 scale-100' 
              : 'opacity-0 transform -translate-y-10 scale-90'
      }`}
      style={{ 
        transitionDelay: '0.6s',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
      }}
    >
      <img src="/images/buff-chicken.png" alt="근육 닭" className="w-60 h-60" />
    </div>
    
    {/* 오른쪽 상단 귀여운 닭 - 사선으로 배치 */}
    <div 
      className={`absolute -top-36 -right-24 z-0 transition-all duration-1000 ${
        isPageLoaded 
          ? 'opacity-100 transform translate-y-0 scale-100' 
              : 'opacity-0 transform -translate-y-10 scale-90'
      }`}
      style={{ 
        transitionDelay: '0.4s',
        transform: isPageLoaded ? 'rotate(15deg)' : 'rotate(15deg) translateX(20px)',
      }}
    >
      <img src="/images/cute-chicken.png" alt="귀여운 닭" className="w-72 h-72" />
    </div>
    
    {/* 하단 중앙 쿨한 닭 - 로고 아래쪽에서 살짝 더 올라옴 */}
    <div 
      className={`absolute -top-[200px] left-1/2 translate-x-[250px] z-0 transition-all duration-1000 ${
        isPageLoaded 
          ? 'opacity-100 transform translate-y-0 scale-100' 
          : 'opacity-0 transform -translate-y-10 scale-90'
      }`}
      style={{ 
        transitionDelay: '0.8s',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
      }}
    >
      <img src="/images/cool-chicken.png" alt="쿨한 닭" className="w-60 h-80" />
    </div>
  </div>
);

  // renderContent 함수
  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return (
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center px-4 relative">
              <div className="absolute top-20 left-0 w-full h-full">
                <ChickenCharacters />
              </div>
              
              <div 
                className={`relative mb-6 z-20 transition-all duration-1000 ${
                  isPageLoaded 
                    ? 'opacity-100 transform translate-y-0 scale-100' 
                    : 'opacity-0 transform -translate-y-10 scale-90'
                }`}
                style={{ 
                  filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.25))',
                }}
              >
                <DrawingLogo/>
              </div>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-16 z-30 relative">
                <div
                  className={`transition-all duration-1000 ${
                    isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                  }`}
                  style={{ transitionDelay: '1s' }}
                >
                  <button 
                    onClick={handleLoginClick}
                    className="w-64 h-20 bg-[#ffd62e] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                  >
                    <span className="text-3xl font-bold text-black font-['Press_Start_2P'] tracking-tight">로그인</span>
                  </button>
                </div>
                
                <div
                  className={`transition-all duration-1000 ${
                    isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                  }`}
                  style={{ transitionDelay: '1.2s' }}
                >
                  <button 
                    onClick={handleGuestClick}
                    className="w-64 h-20 bg-[#888888] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                  >
                    <span className="text-3xl font-bold text-black font-['Press_Start_2P'] tracking-tight">게스트</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
        case 'roomSelection':
          return (
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {/* 로그아웃 버튼 및 사용자 정보 - absolute를 fixed로 변경하고 위치 조정 */}
              <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
                {user && (
                  <>
                    <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 border-2 border-black shadow-md">
                      <span className="font-bold text-black">{user.nickname}</span>
                      {user.characterImage && (
                        <img 
                          src={user.characterImage} 
                          alt="프로필 이미지" 
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 text-white rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                    >
                      로그아웃
                    </button>
                  </>
                )}
              </div>

            <div className="flex flex-col items-center px-4 relative">
              <div className="absolute top-20 left-0 w-full h-full">
                <ChickenCharacters />
              </div>
              
              <div 
                className={`relative mb-6 z-20 transition-all duration-1000 ${
                  isPageLoaded 
                    ? 'opacity-100 transform translate-y-0 scale-100' 
                    : 'opacity-0 transform -translate-y-10 scale-90'
                }`}
                style={{ 
                  filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.25))',
                }}
              >
                <DrawingLogo/>
              </div>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-16 z-30 relative">
                <div
                  className={`transition-all duration-1000 ${
                    isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                  }`}
                  style={{ transitionDelay: '1s' }}
                >
                  <button 
                    onClick={handleCreateRoom}
                    className="w-64 h-20 bg-[#ffd62e] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                  >
                    <span className="text-3xl font-bold text-black font-['Press_Start_2P'] tracking-tight">방 만들기</span>
                  </button>
                </div>
                
                <div
                  className={`transition-all duration-1000 ${
                    isPageLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                  }`}
                  style={{ transitionDelay: '1.2s' }}
                >
                  <button 
                    onClick={() => {
                      const inputRoomCode = prompt('방 코드를 입력하세요:');
                      if (inputRoomCode) {
                        handleJoinRoom(inputRoomCode);
                      }
                    }}
                    className="w-64 h-20 bg-[#888888] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                  >
                    <span className="text-3xl font-bold text-black font-['Press_Start_2P'] tracking-tight">방 찾기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          className="w-full h-full object-cover"
          src="/images/2727.jpg" 
          alt="닭장 배경"
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {renderContent()}
      </div>

      {showLoginModal && (
        <LoginModal 
          closeModal={closeModal}
          handleSignupClick={handleSignupClick}
          handleSocialLogin={handleSocialLogin}
          // onSuccessfulLogin={handleSuccessfulLogin}
        />
      )}

      {showSignupModal && (
        <SignupModal 
          closeModal={closeModal}
          handleLoginClick={handleLoginClick}
          handleSocialLogin={handleSocialLogin}
        />
      )}
    </div>
  );
};

export default LandingPage;