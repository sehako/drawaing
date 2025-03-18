import React from 'react';

interface LoginModalProps {
  closeModal: () => void;
  handleSignupClick: () => void;
  handleSocialLogin: (provider: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ closeModal, handleSignupClick, handleSocialLogin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="relative z-10 bg-yellow-300 p-6 rounded-lg border-4 border-black max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-['Press_Start_2P']">로그인</h2>
          <button 
            onClick={closeModal}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            <span className="text-white font-bold">X</span>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">이메일</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
            placeholder="이메일을 입력하세요"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">비밀번호</label>
          <input 
            type="password" 
            className="w-full px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        
        <div className="flex justify-center mb-6">
          <button 
            className="px-6 py-2 bg-[#ff7a00] text-white font-bold rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
            onClick={() => {
              alert('로그인 되었습니다!');
              closeModal();
            }}
          >
            로그인
          </button>
        </div>
        
        {/* 소셜 로그인 섹션 */}
        <div className="mb-6">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute border-b border-gray-600 w-full"></div>
            <span className="relative bg-yellow-300 px-4 text-sm text-gray-700 font-medium">소셜 계정으로 로그인</span>
          </div>
          
          <div className="flex justify-center space-x-4">
            {/* 카카오 로그인 버튼 */}
            <button 
              onClick={() => handleSocialLogin('카카오')}
              className="w-full p-0 rounded-lg overflow-hidden border-2  border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
            >
              <img 
                src="/images/kakao_login_large_narrow.png" 
                alt="카카오 로그인" 
                className="w-full h-full object-contain"
              />
            </button>
            
            {/* 네이버 로그인 버튼 */}
            <button 
              onClick={() => handleSocialLogin('네이버')}
              className="w-full p-0 rounded-lg overflow-hidden border-2  border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
            >
              <img 
                src="/images/naver_login.png" 
                alt="네이버 로그인" 
                className="w-full h-full object-contain"
              />
            </button>
          </div>
        </div>
        
        {/* 회원가입 버튼 */}
        <div className="flex justify-center">
          <button 
            onClick={handleSignupClick}
            className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            새 계정 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;