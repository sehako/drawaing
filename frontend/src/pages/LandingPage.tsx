import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/landing/LoginModal';
import SignupModal from '../components/landing/SignupModal';
import { AuthContext } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { loginAsGuest } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };

  const handleGuestClick = () => {
    try {
      // 게스트 로그인 처리
      loginAsGuest();
      
      // 게임 페이지로 이동
      navigate('/game');
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

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: string) => {
    try {
      // 여기에 소셜 로그인 API 호출 로직 추가
      // 예: await authService.socialLogin(provider);
      alert(`${provider} 로그인을 시도합니다.`);
      
      // 로그인 성공 시 페이지 이동
      // navigate('/game');
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      alert(`${provider} 로그인에 실패했습니다. 다시 시도해주세요.`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경 이미지 - 닭장 배경 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          className="w-full h-full object-cover"
          src="/images/2727.jpg" 
          alt="닭장 배경"
        />
      </div>
      
      {/* 컨텐츠 컨테이너 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center px-4">
          {/* DRAWAING 픽셀 아트 스타일 로고 */}
          <div className="relative mb-6 z-10">
            <h1 className="text-[100px] md:text-[150px] lg:text-[200px] xl:text-[250px] font-bold font-logo tracking-wider text-center">
              {/* 텍스트 블록별 스타일링 */}
              <span className="relative inline-block">
                {/* D - 주황색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">D</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">D</span>
              </span>
              
              <span className="relative inline-block">
                {/* R - 주황색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">R</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">R</span>
              </span>
              
              <span className="relative inline-block">
                {/* A - 주황색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">A</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">A</span>
              </span>
              
              <span className="relative inline-block">
                {/* W - 주황색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">W</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">W</span>
              </span>
              
              <span className="relative inline-block">
                {/* A - 빨간색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-red-400 to-red-700 text-transparent bg-clip-text">A</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">A</span>
              </span>
              
              <span className="relative inline-block">
                {/* I - 빨간색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-red-400 to-red-700 text-transparent bg-clip-text">I</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">I</span>
              </span>
              
              <span className="relative inline-block">
                {/* N - 주황색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">N</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">N</span>
              </span>
              
              <span className="relative inline-block">
                {/* G - 주황색 */}
                <span className="relative z-10 inline-block px-1 bg-gradient-to-b from-yellow-300 to-orange-500 text-transparent bg-clip-text">G</span>
                {/* 검은색 테두리 효과 */}
                <span className="absolute inset-0 z-0 px-1 text-black transform translate-x-[6px] translate-y-[6px]">G</span>
              </span>
            </h1>
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