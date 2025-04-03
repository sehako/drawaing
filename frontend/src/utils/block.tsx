// utils/BlockNavigation.tsx
import React, { useEffect } from 'react';

const BlockNavigation: React.FC = () => {
  useEffect(() => {
    // 뒤로가기 방지를 위한 함수
    const preventNavigation = (e: PopStateEvent) => {
      // 뒤로가기 시도가 감지되면 현재 URL로 다시 이동
      window.history.pushState(null, '', window.location.href);
      // 이벤트의 기본 동작 차단 (이 부분이 경고창을 방지함)
      e.preventDefault();
    };

    // 새로고침을 완전히 차단하는 함수
    const preventRefresh = (e: KeyboardEvent) => {
      // F5 키 감지 (새로고침)
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        return false;
      }
    };

    // beforeunload 이벤트의 기본 동작 자체를 제거
    const preventUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // 리턴값을 제거하여 경고창이 표시되지 않게 함
      e.returnValue = false;
      return false;
    };

    // 초기 history 상태 설정
    window.history.pushState(null, '', window.location.href);
    
    // 이벤트 리스너 등록
    window.addEventListener('popstate', preventNavigation);
    window.addEventListener('keydown', preventRefresh);
    window.addEventListener('beforeunload', preventUnload, { capture: true });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', preventNavigation);
      window.removeEventListener('keydown', preventRefresh);
      window.removeEventListener('beforeunload', preventUnload, { capture: true });
    };
  }, []);

  return null;
};

export default BlockNavigation;