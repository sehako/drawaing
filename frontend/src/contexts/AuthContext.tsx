// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

type User = {
  id: string;
  username: string;
  email?: string;
  isGuest?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  signup: (userData: { username: string; email: string; password: string }) => Promise<void>; // ?를 제거
  logout: () => void;
  loginAsGuest: () => Promise<any>;
};

// 인증 컨텍스트 생성
export const AuthContext = createContext<AuthContextType | null>(null);

// 인증 컨텍스트를 사용하기 위한 커스텀 훅 생성
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내에서 사용되어야 합니다");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 로드 시 토큰 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // 토큰으로 사용자 정보 가져오기
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('인증 오류:', error);
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // 로그인 함수
  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const { token, user: userData } = response;
      
      // 토큰 저장
      localStorage.setItem('token', token);
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // AuthContext.tsx 파일에서 signup 함수 내부 코드를 다음과 같이 수정

// 회원가입 함수
const signup = async (userData: { username: string; email: string; password: string }) => {
  setIsLoading(true);
  try {
    // signup 대신 register 함수 호출
    const response = await authService.register(userData);
    const { token, user: newUser } = response;
    
    // 토큰 저장
    localStorage.setItem('token', token);
    
    setUser(newUser);
    setIsAuthenticated(true);
  } catch (error) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  // 로그아웃 함수
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      // 로컬 상태 초기화
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 게스트 모드 함수
  const loginAsGuest = async () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      username: '게스트',
      isGuest: true
    };
    
    setUser(guestUser);
    setIsAuthenticated(true);
    return guestUser;
  };

  // 제공하는 컨텍스트 값
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    loginAsGuest
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};