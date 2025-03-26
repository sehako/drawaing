import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './contexts/MusicContext';
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider 임포트 추가

import LandingPage from './pages/LandingPage';
// import LobbyPage from './pages/LobbyPage';
import GameWaitingRoom from './pages/GameWaitingRoom.tsx';
import Game from './pages/Game.tsx'
// import GamePage from './pages/GamePage';
import Bgm from './components/Music/Bgm.tsx';
import axios from 'axios';

// .env 파일의 환경변수 사용
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// 선택적으로 추가할 수 있는 기본 설정들
axios.defaults.withCredentials = true; // 쿠키 포함 설정

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider 추가 */}
        <MusicProvider>
          <Bgm />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* <Route path="/lobby" element={<LobbyPage />} /> */}
            <Route path="/waiting-room/:roomId" element={<GameWaitingRoom />} />
            {/* 나중에 다른 경로들을 추가할 예정 */}
            {/* <Route path="/game/play" element={<GamePage />} /> */}
            <Route path="/game/:roomId" element={<Game />} />
          </Routes>
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;