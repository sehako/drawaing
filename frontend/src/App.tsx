import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './contexts/MusicContext';
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider 임포트 추가

import LandingPage from './pages/LandingPage';
// import LobbyPage from './pages/LobbyPage';
import GameWaitingRoom from './pages/GameWaitingRoom.tsx';
import Game from './pages/Game.tsx'
// 나중에 다른 페이지들을 추가할 예정
// import GamePage from './pages/GamePage';
import Bgm from './components/Music/Bgm.tsx';

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