import React, { useState, useEffect } from 'react';

interface SignupModalProps {
  closeModal: () => void;
  handleLoginClick: () => void;
  handleSocialLogin: (provider: string) => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ closeModal, handleLoginClick, handleSocialLogin }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // 비밀번호 일치 여부 확인
  useEffect(() => {
    if (password && passwordConfirm) {
      setPasswordsMatch(password === passwordConfirm);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, passwordConfirm]);

  // 이메일 인증 코드 전송
  const sendVerificationEmail = () => {
    if (!email || !email.includes('@')) {
      alert('유효한 이메일을 입력해주세요.');
      return;
    }
    
    setIsEmailVerificationSent(true);
    alert(`${email}로 인증 코드가 전송되었습니다.`);
    // 실제 구현 시 서버에 이메일 인증 요청 보내는 코드 추가
  };
  
  // 이메일 인증 확인
  const verifyEmailCode = () => {
    // 실제로는 입력받은 코드와 서버에서 발급한 코드를 비교해야 함
    setIsEmailVerified(true);
    alert('이메일이 성공적으로 인증되었습니다.');
  };
  
  // 닉네임 중복 확인
  const checkNickname = () => {
    if (!nickname || nickname.length < 2) {
      alert('닉네임은 2자 이상 입력해주세요.');
      return;
    }
    
    // 실제로는 서버에 닉네임 중복 확인 요청을 보내야 함
    setIsNicknameChecked(true);
    alert('사용 가능한 닉네임입니다.');
  };

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
        
        {/* 닉네임 입력 필드 */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">닉네임</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsNicknameChecked(false);
              }}
              className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              placeholder="게임에서 사용할 닉네임"
            />
            <button 
              onClick={checkNickname}
              disabled={!nickname || nickname.length < 2}
              className={`px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                !nickname || nickname.length < 2 
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
            />
            <button 
              onClick={sendVerificationEmail}
              disabled={!email || !email.includes('@')}
              className={`px-3 py-1 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:-translate-x-0.5 ${
                !email || !email.includes('@') 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#ff7a00] text-white hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
              }`}
            >
              인증하기
            </button>
          </div>
        </div>
        
        {/* 이메일 인증 코드 입력 */}
        {isEmailVerificationSent && !isEmailVerified && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">인증 코드</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-3 py-2 border-2 border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
                placeholder="이메일로 받은 6자리 코드 입력"
              />
              <button 
                onClick={verifyEmailCode}
                className="px-3 py-1 bg-[#ff7a00] text-white rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200"
              >
                확인하기
              </button>
            </div>
          </div>
        )}
        
        {isEmailVerified && (
          <div className="mb-4">
            <p className="text-green-600 text-sm">✓ 이메일이 성공적으로 인증되었습니다</p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">비밀번호</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border-2 ${
              passwordsMatch === false ? 'border-red-500' : 'border-gray-800'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]`}
            placeholder="비밀번호를 입력하세요"
          />
          <p className="text-xs text-gray-600 mt-1">8자 이상, 영문, 숫자, 특수문자 조합</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">비밀번호 확인</label>
          <div className="relative">
            <input 
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={`w-full px-3 py-2 border-2 ${
                passwordsMatch === false ? 'border-red-500' : 
                passwordsMatch === true ? 'border-green-500' : 'border-gray-800'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff7a00]`}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {passwordConfirm && (
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
        
        {/* 소셜 로그인 섹션 */}
        {/* <div className="mb-6">
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute border-b border-gray-600 w-full"></div>
            <span className="relative bg-yellow-300 px-4 text-sm text-gray-700 font-medium">소셜 계정으로 회원가입</span>
          </div> */}
          
          {/* <div className="flex justify-center space-x-4"> */}
            {/* 카카오 로그인 버튼 */}
            {/* <button 
              onClick={() => handleSocialLogin('카카오')}
              className="w-full py-2 bg-[#FEE500] rounded-md flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
            >
              <span className="font-bold text-sm">카카오로 가입</span>
            </button> */}
            
            {/* 네이버 로그인 버튼 */}
            {/* <button 
              onClick={() => handleSocialLogin('네이버')}
              className="w-full py-2 bg-[#03C75A] rounded-md flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
            >
              <span className="font-bold text-white text-sm">네이버로 가입</span>
            </button>
          </div> */}
        {/* </div> */}
        
        <div className="flex justify-center items-center gap-8">
          <button 
            onClick={handleLoginClick}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all duration-200"
          >
            돌아가기
          </button>
          <button 
            className={`px-4 py-2 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all duration-200 ${
              !isEmailVerified || !isNicknameChecked || passwordsMatch !== true || !password
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#ff7a00] text-white font-bold hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,1)]'
            }`}
            onClick={() => {
              if (isEmailVerified && isNicknameChecked && passwordsMatch === true && password) {
                alert('회원가입이 완료되었습니다!');
                closeModal();
              } else if (passwordsMatch !== true) {
                alert('비밀번호가 일치하지 않습니다.');
              }
            }}
            disabled={!isEmailVerified || !isNicknameChecked || passwordsMatch !== true || !password}
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;