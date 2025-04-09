// AuthContext.tsx - 수정된 버전
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
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => void;
  loginAsGuest: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  loginAsGuest: async () => { throw new Error('Not implemented'); }
});

// 토큰 저장 및 axios 기본 헤더 설정을 위한 유틸리티 함수
const setAuthToken = (token: string) => {
  if (token) {
    // 쿠키에도 토큰 저장 (HttpOnly가 아닌 쿠키)
    document.cookie = `auth_token=${token}; path=/; max-age=86400`; // 24시간 유효
    
    // 로컬 스토리지에도 저장 (이중 보안)
    localStorage.setItem('token', token);
    
    // axios 기본 헤더 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // 쿠키 삭제
    document.cookie = 'auth_token=; path=/; max-age=0';
    
    // 로컬 스토리지에서 삭제
    localStorage.removeItem('token');
    // 로컬 스토리지에서 사용자 정보 삭제
    localStorage.removeItem('user');
    
    // axios 헤더 삭제
    delete axios.defaults.headers.common['Authorization'];
  }
};

// 쿠키에서 토큰 가져오기 함수
const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('auth_token=')) {
      return cookie.substring('auth_token='.length);
    }
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 앱 초기화 시 로컬 스토리지 또는 쿠키에서 사용자 정보와 토큰 로드
  useEffect(() => {
    const loadAuthState = () => {
      try {
        // 1. 먼저 쿠키에서 토큰 확인
        let token = getTokenFromCookie();
        
        // 2. 쿠키에 없으면 로컬 스토리지에서 확인
        if (!token) {
          token = localStorage.getItem('token');
        }
        
        // 토큰이 없으면 인증 상태 없음
        if (!token) return;
        
        // 토큰이 있으면 axios 헤더 설정 및 쿠키/로컬스토리지 모두 업데이트
        setAuthToken(token);
        
        // 사용자 정보 확인
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // 저장된 사용자 정보에 토큰 주입 (혹시 없거나 다를 경우)
          parsedUser.accessToken = token;
          
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          console.log('인증 상태 복원 완료:', parsedUser.nickname);
          
          // 사용자 정보도 최신 토큰으로 업데이트하여 저장
          localStorage.setItem('user', JSON.stringify(parsedUser));
        } else {
          // 토큰은 있지만 사용자 정보가 없는 경우
          // 서버에 사용자 정보 요청 로직 추가 (선택사항)
          console.warn('토큰은 있지만 사용자 정보가 없습니다.');
          
          // 여기서 서버에 요청을 보내 사용자 정보를 가져올 수 있습니다
          // 예: fetchUserInfo(token).then(userData => { ... })
          
          // 임시 조치로 토큰 제거
          setAuthToken('');
        }
      } catch (error) {
        console.error('인증 상태 복원 중 오류:', error);
        // 오류 발생 시 인증 정보 초기화
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken('');
      }
    };
    
    loadAuthState();
  }, []);

  // 로그인 함수 - 사용자 정보를 받아 상태 및 로컬 스토리지 업데이트
  const login = async (userData: User) => {
    try {
      // 사용자 상태 업데이트
      setUser(userData);
      setIsAuthenticated(true);
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(userData));
      
      // 토큰 설정 (axios 헤더, 쿠키 및 로컬 스토리지)
      setAuthToken(userData.accessToken);
      
      console.log('로그인 성공:', userData.nickname);
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      throw error;
    }
  };

  // 로그아웃 함수 - 모든 인증 상태 정리
  const logout = () => {
    try {
      // 로그인 되어 있을 경우만 서버에 로그아웃 요청
      if (user) {
        // 비동기 요청이지만 결과를 기다리지 않고 진행
        axios.post('https://www.drawaing.site/service/auth/api/v1/member/logout', {}, {
          withCredentials: true
        }).catch(error => {
          console.warn('서버 로그아웃 요청 실패:', error);
        });
      }
      
      // 클라이언트 측 상태 초기화
      setUser(null);
      setIsAuthenticated(false);
      
      // 토큰 제거 및 모든 저장소 초기화
      setAuthToken('');
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      
      // 오류가 발생해도 클라이언트 측 상태는 초기화
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken('');
    }
  };

  // 게스트 로그인 함수 - API 호출 및 응답 처리
  const loginAsGuest = async (): Promise<User> => {
    try {
      console.log('게스트 로그인 시도...');
      
      // 게스트 로그인 API 호출
      const response = await fetch('https://www.drawaing.site/service/auth/api/v1/member/guestlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`게스트 로그인 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('게스트 로그인 API 응답:', data);
      
      if (data.code === "SUCCESS" && data.data) {
        // API 응답에서 사용자 데이터 추출
        const userData = data.data;
        
        // User 인터페이스 형식에 맞게 데이터 구성
        const userInfo: User = {
          memberId: userData.memberId,
          nickname: userData.nickname,
          email: userData.email,
          characterImage: userData.characterImage,
          providerType: 'GUEST', // 고정 값으로 설정
          accessToken: userData.AccessToken, // API 응답의 필드명 그대로 사용
          level: userData.level,
          exp: userData.exp,
          point: userData.point
        };
        
        // 로그인 함수 호출하여 사용자 정보 설정
        await login(userInfo);
        
        console.log('게스트 로그인 완료:', userInfo.nickname);
        return userInfo; // 성공 시 사용자 정보 반환
      } else {
        throw new Error('게스트 로그인 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('게스트 로그인 오류:', error);
      throw error; // 오류를 상위로 전파
    }
  };

  // 컨텍스트 제공자 반환
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