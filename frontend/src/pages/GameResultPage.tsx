// import React, { useEffect } from 'react';
// import resultService from '../api/resultService';

// const YourComponent: React.FC = () => {
//   useEffect(() => {
//     const roomId = 'your-room-id';
//     const sessionId = 'your-session-id';
    
//     // 결과 데이터 처리 콜백 함수
//     const handleResultData = (data: any) => {
//       console.log('컴포넌트에서 결과 데이터 처리:', data);
//       // 여기서 필요한 상태 업데이트 등 처리
//     };
    
//     let unsubscribe: () => void;
    
//     // STOMP 클라이언트 초기화 및 구독
//     const setupSubscription = async () => {
//       try {
//         await resultService.initializeClient(roomId, sessionId);
//         unsubscribe = resultService.subscribeToResults(
//           roomId, 
//           sessionId, 
//           handleResultData
//         );
//       } catch (error) {
//         console.error('결과 구독 설정 오류:', error);
//       }
//     };
    
//     setupSubscription();
    
//     // 컴포넌트 언마운트 시 정리
//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//       resultService.disconnect();
//     };
//   }, []);
  
//   return (
//     <div>
//       <h2>웹소켓 결과 데이터 모니터링</h2>
//       <p>콘솔을 확인하세요! (F12 또는 개발자 도구)</p>
//     </div>
//   );
// };

// export default YourComponent;