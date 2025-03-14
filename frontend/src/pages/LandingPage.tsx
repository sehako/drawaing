import React, { useState } from 'react';
import LoginModal from '../components/landing/LoginModal';
import SignupModal from '../components/landing/SignUPModal';

const LandingPage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };

  const handleGuestClick = () => {
    alert('게스트로 게임에 입장합니다!');
    // 나중에 여기에 경로 이동 코드 추가
  };

  const handleSignupClick = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = (provider: string) => {
    alert(`${provider} 로그인을 시도합니다.`);
    // 소셜 로그인 구현 코드 추가
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경 이미지 - 닭장 배경 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          className="w-full h-full object-cover"
          src="/images/chicken-background.jpg" 
          alt="닭장 배경"
        />
      </div>
      
      {/* 컨텐츠 컨테이너 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* 로고 영역 */}
        <div className="w-full max-w-4xl flex flex-col items-center mb-12 px-4">
          {/* DRAWAING 로고 이미지 */}
          <div className="relative mb-6 z-10">
            <img 
              src="/images/drawaing-logo.png" 
              alt="DRAWAING" 
              className="w-full max-w-full mx-auto drop-shadow-[5px_5px_0_rgba(0,0,0,0.5)]"
            />
          </div>
          
          {/* 캐릭터들 배치 */}
          <div className="relative w-full">
            <div className="absolute -top-32 -left-40 z-0">
              <img src="/images/angry-chicken.png" alt="화난 닭" className="w-72 h-72" />
            </div>
            
            <div className="absolute -top-80 left-1/2 -translate-x-1/2 z-0">
              <img src="/images/buff-chicken.png" alt="근육 닭" className="w-80 h-80" />
            </div>
            
            <div className="absolute -top-32 -right-40 z-0">
              <img src="/images/cute-chicken.png" alt="귀여운 닭" className="w-72 h-72" />
            </div>
            
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-0">
              <img src="/images/cool-chicken.png" alt="쿨한 닭" className="w-80 h-100" />
            </div>
          </div>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-16 z-10">
          {/* 로그인 버튼 - 픽셀 스타일 */}
          <button 
            onClick={handleLoginClick}
            className="w-64 h-20 bg-[#ffd62e] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            <span className="text-3xl font-bold text-black font-['Press_Start_2P'] tracking-tight">로그인</span>
          </button>
          
          {/* 게스트 버튼 - 픽셀 스타일 */}
          <button 
            onClick={handleGuestClick}
            className="w-64 h-20 bg-[#888888] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            <span className="text-3xl font-bold text-black font-['Press_Start_2P'] tracking-tight">게스트</span>
          </button>
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      {showLoginModal && (
        <LoginModal 
          closeModal={closeModal}
          handleSignupClick={handleSignupClick}
          handleSocialLogin={handleSocialLogin}
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