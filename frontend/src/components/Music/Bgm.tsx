// src/components/Music/Bgm.tsx
import React, { useState } from 'react';
import { useMusic } from '../../contexts/MusicContext';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Bgm = () => {
  const { 
    currentTrack,
    volume,
    setVolume
  } = useMusic();
  
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  // 트랙이 없으면 아무것도 렌더링하지 않음
  if (!currentTrack) return null;

  // 볼륨 아이콘 선택 (Windows 스타일)
  const getVolumeIcon = () => {
    if (volume === 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.342 1.241 1.519 1.905 2.66 1.905h2.433l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06z" />
          <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.485.75.75 0 0 1-1.06-1.06 4.5 4.5 0 0 0 0-6.365.75.75 0 0 1 0-1.06z" />
        </svg>
      );
    } else if (volume < 0.3) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.342 1.241 1.519 1.905 2.66 1.905h2.433l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06z" />
        </svg>
      );
    } else if (volume < 0.7) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.342 1.241 1.519 1.905 2.66 1.905h2.433l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.342 1.241 1.519 1.905 2.66 1.905h2.433l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06z" />
          <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.485.75.75 0 0 1-1.06-1.06 4.5 4.5 0 0 0 0-6.365.75.75 0 0 1 0-1.06z" />
          <path d="M20.485 5.314a.75.75 0 0 1 1.06 0 9.75 9.75 0 0 1 0 13.788.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06z" />
        </svg>
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2">
      {/* 볼륨 컨트롤 - 클릭 시 왼쪽에 나타남 */}
      <div 
        className={`
          absolute right-full mr-2 bg-white/80 p-2 rounded-lg shadow-lg flex items-center 
          transition-all duration-300 ease-in-out origin-right
          ${isVolumeOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
        `}
      >
        {/* 볼륨 슬라이더 (rc-slider 사용) */}
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(value: number | number[]) => {
            // 타입 가드를 통해 number 타입으로 보장
            const newVolume = Array.isArray(value) ? value[0] : value;
            setVolume(newVolume);
          }}
          className="w-20 mr-2"
          railStyle={{ backgroundColor: '#e0e0e0', height: 8 }}
          trackStyle={{ backgroundColor: '#4a90e2', height: 8 }}
          handleStyle={{
            borderColor: '#4a90e2',
            height: 16,
            width: 16,
            marginTop: -4,
            backgroundColor: '#4a90e2'
          }}
        />
        
        {/* 현재 볼륨 표시 */}
        <span className="text-xs font-medium text-gray-600">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* 볼륨 버튼 */}
      <button
        onClick={() => setIsVolumeOpen(!isVolumeOpen)}
        className="w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
};

export default Bgm;