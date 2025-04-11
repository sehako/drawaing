// src/services/authService.ts

// API 기본 URL - 환경 변수에서 가져오거나 기본값 사용
const API_URL = import.meta.env.VITE_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  nickname: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// 헤더에 인증 토큰 추가
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const authService = {
  // 로그인
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/service/auth/api/v1/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  // 소셜 로그인
  // async socialLogin(provider: string): Promise<AuthResponse> {
  //   try {
  //     const response = await fetch(`${API_URL}/service/auth/api/v1/oauth2/authorization/${provider}?redirect_uri=https://www.drawaing.site/oauth/redirect`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || '소셜 로그인에 실패했습니다.');
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error(`${provider} 로그인 오류:`, error);
  //     throw error;
  //   }
  // },

  // 회원가입
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/service/auth/api/v1/member/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  // 닉네임 중복 확인
  async checkNickname(username: string): Promise<{ available: boolean }> {
    try {
      const response = await fetch(`${API_URL}/auth/check-nickname?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '닉네임 중복 확인에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('닉네임 중복 확인 오류:', error);
      throw error;
    }
  },

  // 이메일 인증 코드 전송
  async sendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '인증 코드 전송에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('이메일 인증 코드 전송 오류:', error);
      throw error;
    }
  },

  // 이메일 인증 코드 확인
  async verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '이메일 인증에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('이메일 인증 확인 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      throw error;
    }
  },

  // 비밀번호 재설정 요청
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '비밀번호 재설정 요청에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('비밀번호 재설정 요청 오류:', error);
      throw error;
    }
  },
};

export default authService;