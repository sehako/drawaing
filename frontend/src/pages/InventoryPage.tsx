import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Ranking/Pagination';

interface InventoryItem {
  inventoryId: number;
  itemId: number; // 아이템 ID
  name: string; // 아이템 이름
  image: string; // 이미지 URL
  category: string; // 카테고리
  description: string; // 설명
  quantity: number; // 수량
}


const InventoryPage: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventoryItems();
  }, [page]);

  const fetchInventoryItems = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`https://www.drawaing.site/service/shop/api/v1/inventory/${userData.memberId}`, {
        params: { page, size: 10 },
      });
      const content = response.data.data.content;

        // 응답 데이터를 Item 타입에 맞게 변환
        const mappedItems = content.map((entry: any) => ({
        inventoryId: entry.inventoryId,
        itemId: entry.item.itemId,
        name: entry.item.name,
        image: entry.item.imageUrl,
        category: entry.item.category,
        description: entry.item.description,
        quantity: entry.quantity,
        }));
      setInventoryItems(mappedItems); // 아이템 목록
      setTotalPages(response.data.data.totalPages); // 전체 페이지 수
    } catch (error) {
      console.error('인벤토리 조회 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      {/* 헤더 */}
      <div className="relative bg-amber-800 rounded-xl p-6 mb-8 border-4 border-amber-900 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-amber-900/10 rounded-xl" />
            <h1 className="text-4xl font-bold text-center text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            🎒 INVENTORY
            </h1>
        </div>

      {/* 아이템 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {inventoryItems.map((item) => (
          <div
            key={item.itemId}
            className="bg-white p-4 rounded-lg border border-blue-200 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] flex flex-col items-center 
                        hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-lg mb-2 border border-gray-300"
            />
            <h3 className="text-sm font-bold mb-1 text-center">{item.name}</h3>
            <p className="text-sm text-blue-600 font-bold">개수: {item.quantity}</p>
            <p className="text-xs text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>

      
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex justify-center">
        {/* 페이지네이션 추가 */}
        <Pagination 
            page={page} 
            setPage={setPage} 
            totalPages={totalPages} 
        />
        </div>
    

      {/* 상점으로 돌아가는 버튼 */}
      <button
          onClick={() => navigate('/shop')}
          className="fixed bottom-4 right-4 px-4 py-2 bg-amber-500 rounded-full text-white font-bold border-2 border-amber-700 shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-amber-600 hover:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[1px] active:translate-x-[1px] transition-all"
        >
          상점으로 돌아가기
        </button>
    </div>
  );
};

export default InventoryPage;
