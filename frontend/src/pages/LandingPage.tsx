import React, { useState } from 'react';
import Modal from '../components/common/Modal';

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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경 이미지 - 닭장 배경 */}
      <div className="absolute inset-0 w-full h-full">
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
          <div className="relative mb-6">
            <img 
              src="/images/drawaing-logo.png" 
              alt="DRAWAING" 
              className="w-full max-w-2xl mx-auto drop-shadow-[5px_5px_0_rgba(0,0,0,0.5)]"
            />
          </div>
          
          {/* 캐릭터들 배치 */}
          <div className="relative w-full">
            <div className="absolute -top-32 -left-16">
              <img src="/images/angry-chicken.png" alt="화난 닭" className="w-32 h-32" />
            </div>
            
            <div className="absolute -top-36 left-1/2 -translate-x-1/2">
              <img src="/images/buff-chicken.png" alt="근육 닭" className="w-40 h-40" />
            </div>
            
            <div className="absolute -top-32 -right-16">
              <img src="/images/cute-chicken.png" alt="귀여운 닭" className="w-32 h-32" />
            </div>
            
            <div className="absolute top-12 left-1/2 -translate-x-1/2">
              <img src="/images/cool-chicken.png" alt="쿨한 닭" className="w-40 h-40" />
            </div>
          </div>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-16">
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

      {/* 로그인 모달 */}
      {showLoginModal && (
        <Modal onClose={closeModal}>
          <div className="p-6 bg-yellow-300">
            <h2 className="text-2xl font-bold mb-4 font-['Press_Start_2P'] ">로그인</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">아이디</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="아이디를 입력하세요"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">비밀번호</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
              >
                취소
              </button>
              <button 
                className="px-4 py-2 bg-[#ff7a00] text-white rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                onClick={() => {
                  alert('로그인 되었습니다!');
                  closeModal();
                }}
              >
                로그인
              </button>
            </div>
            
            {/* 회원가입 버튼 추가 */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={handleSignupClick}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                회원가입 하기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 회원가입 모달 */}
      {showSignupModal && (
        <Modal onClose={closeModal}>
          <div className="p-6 bg-green-200">
            <h2 className="text-2xl font-bold mb-4 font-['Press_Start_2P'] ">회원가입</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">아이디</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="아이디를 입력하세요"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">비밀번호</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">비밀번호 확인</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
              >
                로그인으로 돌아가기
              </button>
              <button 
                className="px-4 py-2 bg-[#2ecc71] text-white rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
                onClick={() => {
                  alert('회원가입이 완료되었습니다!');
                  closeModal();
                }}
              >
                가입하기
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LandingPage;