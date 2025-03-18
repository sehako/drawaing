import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// 나중에 다른 페이지들을 추가할 예정
// import GamePage from './pages/GamePage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* 나중에 다른 경로들을 추가할 예정 */}
        {/* <Route path="/game" element={<GamePage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;