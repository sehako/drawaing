import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// import LobbyPage from './pages/LobbyPage';
import GameWaitingRoom from './pages/GameWaitingRoom.tsx';
// 나중에 다른 페이지들을 추가할 예정
// import GamePage from './pages/GamePage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/lobby" element={<LobbyPage />} /> */}
        <Route path="/waiting-room/:roomId" element={<GameWaitingRoom />} />
        {/* 나중에 다른 경로들을 추가할 예정 */}
        {/* <Route path="/game/play" element={<GamePage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;