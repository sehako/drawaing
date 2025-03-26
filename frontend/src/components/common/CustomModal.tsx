// src/components/common/CustomModal.tsx
import React, { ReactNode, useEffect, useRef } from 'react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  media?: {
    type?: 'gif' | 'mp4' | 'image';
    src: string;
    alt?: string;
  };
  actionButtons?: {
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  media,
  actionButtons
}) => {
  // ref를 사용하여 초기 미디어 값 저장 (상태 대신 ref 사용으로 불필요한 리렌더링 방지)
  const mediaRef = useRef(media);
  
  // 컴포넌트 마운트 시에만 미디어 정보 설정
  useEffect(() => {
    if (media) {
      mediaRef.current = media;
      console.log('[CustomModal] Initial media set:', media);
    }
  }, []);

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    if (actionButtons?.onConfirm) {
      actionButtons.onConfirm();
    }
    onClose();
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    if (actionButtons?.onCancel) {
      actionButtons.onCancel();
    }
    onClose();
  };

  // 미디어 렌더링
  const renderMedia = () => {
    const currentMedia = mediaRef.current;
    
    if (!currentMedia?.src) {
      console.log('[CustomModal] No media source');
      return null;
    }

    // 모달 인스턴스와 미디어 소스를 로깅
    console.log(`[CustomModal] Rendering media for modal with title "${title}":`, currentMedia);

    // 파일 확장자 확인
    const srcString = String(currentMedia.src);
    const fileExtension = srcString.split('.').pop()?.toLowerCase();
    
    console.log(`[CustomModal] File extension for "${title}" modal:`, fileExtension);

    // 미디어 타입에 따른 렌더링
    switch (currentMedia.type) {
      case 'gif':
        console.log(`[CustomModal] Rendering GIF for "${title}" modal`);
        return (
          <img 
            key={`gif-${title}-${Date.now()}`} // 고유한 키 생성
            src={currentMedia.src}
            alt={currentMedia.alt || 'GIF 이미지'} 
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '300px' }}
            onLoad={() => console.log(`[CustomModal] GIF for "${title}" modal loaded successfully`)}
            onError={(e) => {
              console.error(`[CustomModal] GIF for "${title}" modal 로딩 실패:`, e);
            }}
          />
        );
        
      case 'image':
        console.log(`[CustomModal] Rendering image for "${title}" modal`);
        return (
          <img 
            key={`img-${title}-${Date.now()}`}
            src={currentMedia.src}
            alt={currentMedia.alt || '이미지'} 
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '300px' }}
            onLoad={() => console.log(`[CustomModal] Image for "${title}" modal loaded successfully`)}
            onError={(e) => {
              console.error(`[CustomModal] 이미지 for "${title}" modal 로딩 실패:`, e);
            }}
          />
        );
        
      case 'mp4':
        console.log(`[CustomModal] Rendering video for "${title}" modal`);
        return (
          <video 
            key={`video-${title}-${Date.now()}`}
            src={currentMedia.src} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '300px' }}
            onLoadedData={() => console.log(`[CustomModal] Video for "${title}" modal loaded successfully`)}
            onError={(e) => {
              console.error(`[CustomModal] 비디오 for "${title}" modal 로딩 실패:`, e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        );
        
      default:
        // 파일 확장자 기반 추론
        if (fileExtension === 'gif') {
          return (
            <img 
              key={`auto-gif-${title}-${Date.now()}`}
              src={currentMedia.src}
              alt={currentMedia.alt || 'GIF 이미지'} 
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '300px' }}
            />
          );
        } else if (fileExtension === 'mp4') {
          return (
            <video 
              key={`auto-video-${title}-${Date.now()}`}
              src={currentMedia.src} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '300px' }}
            >
              Your browser does not support the video tag.
            </video>
          );
        }
        
        // 기본값은 이미지로 처리
        return (
          <img 
            key={`default-${title}-${Date.now()}`}
            src={currentMedia.src}
            alt={currentMedia.alt || '이미지'} 
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '300px' }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black opacity-50" 
        onClick={onClose}
      ></div>

      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 bg-yellow-50">
        {/* 모달 헤더 */}
        {title && (
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        )}

        {/* 미디어 */}
        {mediaRef.current?.src && (
          <div className="mb-4 flex justify-center">
            {renderMedia()}
          </div>
        )}

        {/* 모달 콘텐츠 */}
        <div className="mb-4">
          {children}
        </div>

        {/* 액션 버튼들 */}
        {actionButtons && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleConfirm}
              className="px-8 py-2 bg-yellow-200 text-black rounded hover:bg-yellow-600"
            >
              {actionButtons.confirmText || '확인'}
            </button>
            {actionButtons.cancelText && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-yellow-200 text-black rounded hover:bg-yellow-600"
              >
                {actionButtons.cancelText || '취소'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomModal;