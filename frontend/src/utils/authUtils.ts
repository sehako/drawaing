// 쿠키 또는 localStorage에서 토큰 가져오기
export const getAuthToken = (): string | null => {
    // 1. 먼저 쿠키에서 확인
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('auth_token=')) {
        return cookie.substring('auth_token='.length);
      }
    }
    
    // 2. 쿠키에 없으면 로컬 스토리지에서 가져옴
    return localStorage.getItem('token');
  };