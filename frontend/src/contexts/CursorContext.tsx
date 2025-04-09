// src/contexts/CursorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 커서 타입 정의 (필요에 따라 확장 가능)
type CursorType = 'default' | 'pointer' | 'text';

interface CursorContextType {
  cursor: CursorType;
  setCursor: (cursor: CursorType) => void;
  // 편의를 위한 이벤트 핸들러 추가
  getPointerHandlers: () => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  getTextHandlers: () => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cursor, setCursor] = useState<CursorType>('default');

  // 버튼용 포인터 핸들러
  const getPointerHandlers = () => ({
    onMouseEnter: () => setCursor('default'),
    onMouseLeave: () => setCursor('default')
  });

  // 입력 필드용 텍스트 핸들러
  const getTextHandlers = () => ({
    onMouseEnter: () => setCursor('default'),
    onMouseLeave: () => setCursor('default')
  });

  return (
    <CursorContext.Provider value={{ 
      cursor, 
      setCursor, 
      getPointerHandlers, 
      getTextHandlers 
    }}>
      <div className={`cursor-wrapper cursor-${cursor}`}>
        {children}
      </div>
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) throw new Error('useCursor must be used within a CursorProvider');
  return context;
};