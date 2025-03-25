// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  memberId: number;
  nickname: string;
  email: string;
  characterImage: string | null;
  providerType: string;
  accessToken: string;
  level?: number;
  point?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  loginAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  loginAsGuest: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (userData: User) => {
    // 사용자 정보 저장
    setUser(userData);
    setIsAuthenticated(true);
    
    // 로컬 스토리지에 사용자 정보 저장
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 토큰을 기본 axios 헤더에 추가 (선택적)
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
  };

  const logout = async () => {
    try {
      // 로그아웃 API 호출
      await axios.post('/service/auth/api/v1/member/signout');
      
      // 사용자 정보 초기화
      setUser(null);
      setIsAuthenticated(false);
      
      // 로컬 스토리지에서 사용자 정보 제거
      localStorage.removeItem('user');
      
      // 토큰 헤더 제거 (선택적)
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 선택적: 로그아웃 실패 시 사용자에게 알림
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const loginAsGuest = async () => {
    // 게스트 로그인 로직 구현
    const guestUserData: User = {
      memberId: 0,
      nickname: 'Guest',
      email: 'guest@example.com',
      characterImage: null,
      providerType: 'GUEST',
      accessToken: '',
    };

    await login(guestUserData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      loginAsGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);