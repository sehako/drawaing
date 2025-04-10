// src/App.tsx
import React,{useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './contexts/MusicContext';
import { AuthProvider } from './contexts/AuthContext';

import LandingPage from './pages/LandingPage';
import GameWaitingRoom from './pages/GameWaitingRoom.tsx';
import Game from './pages/Game.tsx';
import GameResultPage from './pages/GameResultPage.tsx';
import Bgm from './components/Music/Bgm.tsx';
import BlockNavigation from './utils/block.tsx';
import axios from 'axios';
import HardcodedGameResultPage from './pages/HardcodeGameResultPage.tsx';
import { CursorProvider } from './contexts/CursorContext';

// .env 파일의 환경변수 사용
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// 선택적으로 추가할 수 있는 기본 설정들
axios.defaults.withCredentials = true; // 쿠키 포함 설정

const App: React.FC = () => {
  useEffect(() => {
    // 문서의 모든 요소에 커서 스타일 적용
    document.documentElement.style.cursor = `url('/images/default-cursor.png'), auto`;
    document.body.style.cursor = `url('/images/default-cursor.png'), auto`;
    
    // 모든 요소에 적용
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      (el as HTMLElement).style.cursor = `url('/images/default-cursor.png'), auto`;
    });
    
    return () => {
      // 정리 함수
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
    };
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        <MusicProvider>
          <CursorProvider>
            <Bgm />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/waiting-room/:roomId" element={
                <>
                  <BlockNavigation /> {/* 이 페이지에서만 새로고침/뒤로가기 방지 */}
                  <GameWaitingRoom />
                </>
              } />
              <Route path="/game/:roomId" element={
                <>
                  <BlockNavigation /> {/* 이 페이지에서만 새로고침/뒤로가기 방지 */}
                  <Game />
                </>
              } />
              <Route path="/result/:roomId" element={
                <>
                  <BlockNavigation /> {/* 이 페이지에서도 새로고침/뒤로가기 방지 */}
                  <GameResultPage />
                </>
              } />
            </Routes>
          </CursorProvider>
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;