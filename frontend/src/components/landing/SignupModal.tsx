import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'
import authService from '../../services/authService';

interface SignupModalProps {
  closeModal: () => void;
  handleLoginClick: () => void;
  handleSocialLogin: (provider: string) => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ closeModal, handleLoginClick, handleSocialLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);

  // 유효성 검사 함수
  const validateForm = () => {
    // 모든 필드가 입력되었는지 확인
    if (!username || !email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }
    
    // 비밀번호 길이 검사
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    
    // 비밀번호 일치 검사
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    return true;
  };

  // 회원가입 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 회원가입 API 호출
      const response = await authService.register({ username, email, password });
      
      // 회원가입 성공 시 자동 로그인
      await login({ email, password });
      
      // 모달 닫기
      closeModal();
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="relative z-10 bg-yellow-300 p-6 rounded-lg border-4 border-black max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-pixel">회원가입</h2>
          <button 
            onClick={closeModal}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            <span className="text-white font-bold">X</span>
          </button>
        </div>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">사용자 이름</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              placeholder="사용자 이름을 입력하세요"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">이메일</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">비밀번호</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">비밀번호 확인</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          
          <div className="flex justify-center mb-6">
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#ff7a00] text-white font-bold rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
        
        {/* 소셜 로그인 섹션 */}
        <div className="mb-6">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute border-b border-gray-600 w-full"></div>
            <span className="relative bg-yellow-300 px-4 text-sm text-gray-700 font-medium">소셜 계정으로 가입</span>
          </div>
          
          <div className="flex justify-center space-x-4">
            {/* 카카오 로그인 버튼 */}
            <button 
              type="button"
              onClick={() => handleSocialLogin('카카오')}
              className="w-full p-0 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
              disabled={isLoading}
            >
              <img 
                src="/images/kakao_login_large_narrow.png" 
                alt="카카오 로그인" 
                className="w-full h-full object-contain"
              />
            </button>
            
            {/* 네이버 로그인 버튼 */}
            <button 
              type="button"
              onClick={() => handleSocialLogin('네이버')}
              className="w-full p-0 rounded-lg overflow-hidden border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
              disabled={isLoading}
            >
              <img 
                src="/images/naver_login.png" 
                alt="네이버 로그인" 
                className="w-full h-full object-contain"
              />
            </button>
          </div>
        </div>
        
        {/* 로그인 버튼 */}
        <div className="flex justify-center">
          <button 
            type="button"
            onClick={handleLoginClick}
            className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
            disabled={isLoading}
          >
            이미 계정이 있어요
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;