import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">그림 그리기 협동 게임</h1>
        <p className="home-description">
          친구들과 함께 그림을 그리고 맞춰보세요!
          각자 한 획씩 그려 완성하는 협동 게임입니다.
        </p>
        <div className="home-buttons">
          <Link to="/game" className="start-button">게임 시작하기</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;