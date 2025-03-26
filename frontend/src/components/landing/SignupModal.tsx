import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface SignupModalProps {
  closeModal: () => void;
  handleLoginClick: () => void;
  handleSocialLogin: (provider: string) => void;
}

interface SignupResponse {
  message: string;
  data: {
    memberId: string;
    nickname: string;
    email: string;
    profileImg?: string;
    provider_type: string;
    createdAt: string;
  };
}

const SignupModal: React.FC<SignupModalProps> = ({ 
  closeModal, 
  handleLoginClick, 
  handleSocialLogin 
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 유효성 검사를 위한 상태 추가
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false
  });

  // 인증 관련 상태
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  
  const { login } = useAuth();

  // 비밀번호 입력시마다 요구사항 충족 여부 확인
  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        length: password.length >= 8,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      });
    } else {
      setPasswordRequirements({
        length: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecial: false
      });
    }
  }, [password]);

  // 비밀번호 일치 여부 확인
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

  // 이메일 인증 코드 전송
  const sendVerificationEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('유효한 이메일을 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 이메일 인증 코드 전송 API 호출
      await axios.post('/service/auth/api/v1/member/email/code', { email });
      
      setIsEmailVerificationSent(true);
      alert(`${email}로 인증 코드가 전송되었습니다.`);
    } catch (err: any) {
      console.error('이메일 인증 코드 전송 오류:', err);
      setError(err.response?.data?.message || '이메일 인증 코드 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 이메일 인증 확인
  const verifyEmailCode = async () => {
    if (!verificationCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 이메일 인증 코드 검증 API 호출
      await axios.post('/service/auth/api/v1/member/email/authentication', { 
        email, 
        verificationCode 
      });
      
      setIsEmailVerified(true);
      alert('이메일이 성공적으로 인증되었습니다.');
    } catch (err: any) {
      console.error('이메일 인증 확인 오류:', err);
      setError(err.response?.data?.message || '이메일 인증에 실패했습니다. 올바른 코드를 입력해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkNickname = async () => {
    // 1. 입력값 정제
    const trimmedUsername = username.trim();
    
    // 2. 유효성 검사 강화
    if (!trimmedUsername) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    
    if (trimmedUsername.length < 2) {
      setError('닉네임은 2자 이상 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 3. URL 인코딩 처리
      const encodedNickname = encodeURIComponent(trimmedUsername);
      
      // 4. API 호출 시 에러 처리 개선
      const response = await axios.get(
        `/service/auth/api/v1/member/nickname/duplication?nickname=${encodedNickname}`,
        {
          // 5. 캐시 방지
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      // 6. 응답 데이터 검증
      if (response.data?.isDuplicate) {
        setError('이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
        return;
      }
      
      setIsNicknameChecked(true);
      alert('사용 가능한 닉네임입니다.');
      
    } catch (err: any) {
      console.error('닉네임 중복 확인 오류:', err);
      
      // 7. 에러 메시지 처리 개선
      const errorMessage = err.response?.data?.message || 
        err.response?.status === 409 ? '이미 사용 중인 닉네임입니다.' :
        '닉네임 중복 확인 중 오류가 발생했습니다.';
      
      setError(errorMessage);
      setIsNicknameChecked(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 유효성 검사 함수
  const validateForm = () => {
    // 모든 필드가 입력되었는지 확인
    if (!username || !email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }
    
    // 닉네임 중복 확인 여부
    if (!isNicknameChecked) {
      setError('닉네임 중복 확인을 해주세요.');
      return false;
    }
    
    // 이메일 인증 여부
    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return false;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }
    
    // 비밀번호 길이 검사
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }
    
    // 비밀번호 복잡성 검사 (영문, 숫자, 특수문자 조합)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasLetter || !hasNumber || !hasSpecial) {
      setError('비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.');
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
      const response = await axios.post<SignupResponse>('/service/auth/api/v1/member/signup', {
        nickname: username,
        email,
        password
      });
      
      // 여기서 로그를 추가하여 확인
  console.log('전송할 데이터:', {
    nickname: username,
    email,
    password: '(비밀번호)' // 비밀번호는 보안상 실제 값은 로그에 남기지 않음
  });
      // 회원가입 성공 메시지 표시
      alert(response.data.message);
      
      // 회원가입 성공 후 자동 로그인 시도
      await login({
        email,
        password
      });
      
      // 모달 닫기
      closeModal();
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      setError(err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이하 기존 렌더링 코드는 그대로 유지
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="relative z-10 bg-yellow-300 p-6 rounded-lg border-4 border-black max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-['Press_Start_2P']">회원가입</h2>
          <button 
            onClick={closeModal}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            <span className="text-white font-bold">X</span>
          </button>
        </div>
        
        {/* 기존 컴포넌트 렌더링 로직 유지 */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* 닉네임 입력 필드 */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">닉네임</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsNicknameChecked(false);
                }}
                className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="게임에서 사용할 닉네임"
                required
              />
              <button 
                type="button"
                onClick={checkNickname}
                disabled={!username || username.length < 2 || isLoading}
                className={`px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                  !username || username.length < 2 || isLoading
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#ff7a00] text-white hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                }`}
              >
                중복확인
              </button>
            </div>
            {isNicknameChecked && (
              <p className="text-green-600 text-sm mt-1">✓ 사용 가능한 닉네임입니다</p>
            )}
          </div>
          
          {/* 이메일 입력 필드 */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">이메일</label>
            <div className="flex gap-2">
              <input 
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                  setIsEmailVerificationSent(false);
                }}
                className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="이메일을 입력하세요"
                required
              />
              <button 
                type="button"
                onClick={sendVerificationEmail}
                disabled={!email || !email.includes('@') || isLoading}
                className={`px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                  !email || !email.includes('@') || isLoading
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#ff7a00] text-white hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                }`}
              >
                인증하기
              </button>
            </div>
            
            {/* 이메일 인증 상태 메시지 */}
            {isEmailVerified && (
              <p className="text-green-600 text-sm mt-1">✓ 이메일이 성공적으로 인증되었습니다</p>
            )}
          </div>

          {/* 이메일 인증 코드 입력 */}
          {isEmailVerificationSent && !isEmailVerified && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">인증 코드</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                  placeholder="이메일로 받은 6자리 코드 입력"
                />
                <button 
                  type="button"
                  onClick={verifyEmailCode}
                  disabled={!verificationCode || isLoading}
                  className={`px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                    !verificationCode || isLoading
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#ff7a00] text-white hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                  }`}
                >
                  확인하기
                </button>
              </div>
            </div>
          )}
          
          {/* 비밀번호 입력 필드 */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">비밀번호</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border-2 ${
                password && (!passwordRequirements.length || !passwordRequirements.hasLetter || 
                          !passwordRequirements.hasNumber || !passwordRequirements.hasSpecial)
                  ? 'border-red-500' 
                  : password ? 'border-green-500' : 'border-gray-800'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]`}
              placeholder="비밀번호를 입력하세요"
              required
            />

            {/* 비밀번호 요구사항 표시 */}
            {password && (
              <div className="mt-2 text-xs flex flex-wrap gap-2">
                <p className={passwordRequirements.length ? "text-green-600" : "text-red-600"}>
                  {passwordRequirements.length ? "✓" : "✗"} 8자 이상 
                </p>
                <p className={passwordRequirements.hasLetter ? "text-green-600" : "text-red-600"}>
                  {passwordRequirements.hasLetter ? "✓" : "✗"} 영문 포함
                </p>
                <p className={passwordRequirements.hasNumber ? "text-green-600" : "text-red-600"}>
                  {passwordRequirements.hasNumber ? "✓" : "✗"} 숫자 포함
                </p>
                <p className={passwordRequirements.hasSpecial ? "text-green-600" : "text-red-600"}>
                  {passwordRequirements.hasSpecial ? "✓" : "✗"} 특수문자 포함
                </p>
              </div>
            )}
            {!password && <p className="text-xs text-gray-600 mt-1">8자 이상, 영문, 숫자, 특수문자 조합</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">비밀번호 확인</label>
            <div className="relative">
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border-2 ${
                  passwordsMatch === false ? 'border-red-500' : 
                  passwordsMatch === true ? 'border-green-500' : 'border-gray-800'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]`}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? (
                    <span className="text-green-600 text-lg">✓</span>
                  ) : (
                    <span className="text-red-600 text-lg">✗</span>
                  )}
                </div>
              )}
            </div>
            {passwordsMatch === false && (
              <p className="text-red-500 text-xs mt-1">비밀번호가 일치하지 않습니다</p>
            )}
            {passwordsMatch === true && (
              <p className="text-green-600 text-xs mt-1">비밀번호가 일치합니다</p>
            )}
          </div>
          
          <div className="flex justify-center mb-6">
            <button 
              type="submit"
              disabled={isLoading || !isEmailVerified || !isNicknameChecked || passwordsMatch !== true || !password}
              className={`px-6 py-2 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 ${
                isLoading || !isEmailVerified || !isNicknameChecked || passwordsMatch !== true || !password
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-[#ff7a00] text-white font-bold hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)]'
              }`}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
        
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