// src/contexts/MusicContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface MusicContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  setPlaying: (playing: boolean) => void;
  currentTrack: string;
  trackTitle: string;
  volume: number;
  setVolume: (newVolume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('/Music/Music1.mp3');
  const [trackTitle, setTrackTitle] = useState('Music1');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  
  // 볼륨 상태 관리 (로컬 스토리지 사용)
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('bgmVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.3; // 기본값 0.3
  });

  // 볼륨 변경 핸들러
  const handleVolumeChange = useCallback((newVolume: number) => {
    // 볼륨 범위 제한 (0-1 사이)
    const constrainedVolume = Math.max(0, Math.min(1, newVolume));
    
    // 로컬 스토리지에 저장
    localStorage.setItem('bgmVolume', constrainedVolume.toString());
    
    // 현재 오디오 참조에 볼륨 적용
    if (audioRef.current) {
      audioRef.current.volume = constrainedVolume;
      console.log(`볼륨 변경: ${constrainedVolume}`);
    }
    
    // 상태 업데이트
    setVolume(constrainedVolume);
  }, []);
  
// 경로에 따라 트랙 변경
useEffect(() => {
  let newTrack = '';
  let newTrackTitle = '';
  
  // 경로별 음악 설정 (기존 코드 유지)
  if (location.pathname === '/') {
    newTrack = '/Music/Music1.mp3';
    newTrackTitle = 'Music1';
  } else if (location.pathname.startsWith('/game')) {
    newTrack = '/Music/Music2.mp3';
    newTrackTitle = 'Music2';
  } else if (location.pathname.startsWith('/waiting-room')) {
    newTrack = '/Music/Music3.mp3';
    newTrackTitle = 'Music3';
  } else {
    // 다른 페이지는 음악 없음
    newTrack = '';
    newTrackTitle = '음악 없음';
  }
  
  // 트랙이 변경되었을 때 처리
  if (newTrack !== currentTrack) {
    console.log(`트랙 변경: ${currentTrack} -> ${newTrack}`);
    
    // 기존 오디오 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setCurrentTrack(newTrack);
    setTrackTitle(newTrackTitle);
    
    // 새 트랙이 있는 경우에만 오디오 생성
    if (newTrack) {
      // 새 오디오 생성 및 설정
      const audio = new Audio(newTrack);
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
      
      // 트랙 변경 시 항상 재생 시도
      audio.play()
        .then(() => {
          setIsPlaying(true);
          console.log(`새 트랙 재생 성공: ${newTrackTitle}`);
        })
        .catch(error => {
          console.error('트랙 변경 중 자동 재생 실패:', error);
          setIsPlaying(false);
          // 재생 실패 시 사용자 상호작용 리스너 설정
          setupUserInteractionListeners();
        });
    } else {
      // 트랙이 없으면 재생 중지
      setIsPlaying(false);
    }
  }
}, [location.pathname, volume]);
  
  // 초기 로드 시 1초 후 재생 시도
  useEffect(() => {
    if (!audioRef.current && currentTrack) {
      const audio = new Audio(currentTrack);
      audio.loop = true;
      audio.volume = volume; // 초기 볼륨 설정
      audioRef.current = audio;
    }
    
    if (audioRef.current && !isPlaying && currentTrack) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log('음악 재생 시작됨');
        })
        .catch(error => {
          console.error('자동 재생 실패:', error);
        });
    }
  }, [currentTrack, volume]);
  
  
  // 사용자 상호작용 감지 함수
  const handleUserInteraction = () => {
    if (!isPlaying && audioRef.current && currentTrack) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log('사용자 상호작용으로 음악 재생 시작됨');
          cleanupUserInteractionListeners();
        })
        .catch(error => {
          console.error('재생 실패:', error);
        });
    }
  };
  
  // 사용자 상호작용 리스너 설정
  const setupUserInteractionListeners = () => {
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
  };
  
  // 사용자 상호작용 리스너 정리
  const cleanupUserInteractionListeners = () => {
    document.removeEventListener('click', handleUserInteraction);
    document.removeEventListener('touchstart', handleUserInteraction);
    document.removeEventListener('keydown', handleUserInteraction);
  };
  
  // 음악 재생/정지 토글 함수
  const toggleMusic = () => {
    if (!currentTrack) return; // 음악 파일이 없으면 아무 작업도 하지 않음
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('재생 실패:', error);
          });
      }
    }
  };
  
  const setPlaying = (playing: boolean) => {
    if (!currentTrack) return; // 음악 파일이 없으면 아무 작업도 하지 않음
    
    if (audioRef.current) {
      if (playing && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('재생 실패:', error);
          });
      } else if (!playing && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  return (
    <MusicContext.Provider 
      value={{ 
        isPlaying, 
        toggleMusic, 
        setPlaying, 
        currentTrack, 
        trackTitle,
        volume,
        setVolume: handleVolumeChange
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};