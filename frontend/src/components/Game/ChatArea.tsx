import React, { useRef, useEffect } from 'react';

interface ChatAreaProps {
  chatMessages: string[];
  chatInput?: string;
  isConnected: boolean;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  chatEnabled?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  chatMessages,
  chatInput = '',
  isConnected,
  onInputChange,
  onSubmit,
  chatEnabled = false
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 채팅 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    // 지연 시간을 두어 DOM이 업데이트된 후 스크롤 적용
    const scrollTimer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
    
    return () => clearTimeout(scrollTimer);
  }, [chatMessages]);

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-black p-3 sm:p-4 flex flex-col h-64 sm:h-72">
      <div 
        ref={chatContainerRef}
        className="h-full overflow-y-auto mb-2 p-2 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-amber-200"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="space-y-2">
          {chatMessages.map((message, index) => (
            <div key={index} className="p-2 rounded">
              <p className="break-words text-sm sm:text-base">{message}</p>
            </div>
          ))}
        </div>
      </div>
      
      {chatEnabled && onInputChange && onSubmit && (
        <form onSubmit={onSubmit} className="flex mt-auto">
          <input
            type="text"
            value={chatInput}
            onChange={onInputChange}
            placeholder="메시지 입력..."
            className="flex-1 p-2 sm:p-3 border-4 border-black rounded-l-lg focus:outline-none text-sm sm:text-base"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className={`${isConnected ? 'bg-amber-400 hover:bg-amber-500' : 'bg-gray-400'} text-black px-3 sm:px-4 py-2 font-bold border-y-4 border-r-4 border-black rounded-r-lg text-sm sm:text-base`}
            disabled={!isConnected}
          >
            전송
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatArea;