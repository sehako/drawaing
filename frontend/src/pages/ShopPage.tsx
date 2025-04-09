import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryTabs from '../components/Shop/CategoryTabs';
import Pagination from '../components/Ranking/Pagination';
import { useNavigate } from 'react-router-dom';


interface Item {
    id: number; // 아이템 ID
    name: string; // 아이템 이름
    image: string; // 이미지 URL
    price: number; // 가격
    category: string; // 카테고리
    description: string; // 설명
    levelLimit: number; // 레벨 제한
    storeId: number; // 상점 ID
    isQuantityLimited: boolean; // 수량 제한 여부
    remainingQuantity: number | null; // 남은 수량 (제한된 경우)
    soldQuantity: number; // 판매된 수량
  }

const ShopPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState<string>('CHARACTER');
  const [userPoint, setUserPoint] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchUserPoint();
  }, [category, page]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('https://www.drawaing.site/service/shop/api/v1/store/items', {
        params: { category, page, size: 10 },
      });
      console.log('아이템 조회:', response.data);

    const content = response.data.data.content;

    // 응답 데이터를 Item 타입에 맞게 변환
    const mappedItems = content.map((entry: any) => ({
      id: entry.item.itemId,
      name: entry.item.name,
      image: entry.item.imageUrl,
      price: entry.price,
      category: entry.item.category,
      description: entry.item.description,
      levelLimit: entry.item.levelLimit,
      storeId: entry.storeId,
      isQuantityLimited: entry.isQuantityLimited,
      remainingQuantity: entry.remainingQuantity,
      soldQuantity: entry.soldQuantity,
    }));

    setItems(mappedItems); // 변환된 데이터를 상태에 저장
    setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('아이템 조회 오류:', error);
    }
  };

  const fetchUserPoint = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('사용자 데이터:', userData);
      const response = await axios.get(`https://www.drawaing.site/service/auth/api/v1/member/${userData.memberId}`,
        {
          headers: {Authorization: `Bearer ${userData.accessToken}` },
          withCredentials: true,
        }
      );
      setUserPoint(response.data.data.point);
    } catch (error) {
      console.error('사용자 잔액 조회 오류:', error);
    }
  };

  const handlePurchase = async (itemId: number, itemPrice: number) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      // 포인트 확인
      if (userPoint < itemPrice) {
        alert('포인트가 부족합니다.');
        return; // 함수 종료
      }
      await axios.post(`https://www.drawaing.site/service/shop/api/v1/store/purchase`, {
        memberId: userData.memberId,
        itemId: itemId,
        price: itemPrice,
        quantity: 1, // 기본적으로 1개 구매
      });
      alert('구매가 완료되었습니다!');
      fetchUserPoint(); // 잔액 업데이트
    } catch (error) {
      console.error('구매 오류:', error);
      alert('구매에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-8">
        {/* 헤더 */}
        <div className="relative bg-amber-800 rounded-xl p-6 mb-8 border-4 border-amber-900 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-amber-900/10 rounded-xl" />
            <h1 className="text-4xl font-bold text-center text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            🛒 SHOP
            </h1>
        </div>

        <div className="flex items-start gap-4 mb-2">
            {/* 카테고리 탭 */}
            <div className="flex-grow">
                <CategoryTabs category={category} setCategory={setCategory} />
            </div>

            {/* 사용자 잔액 및 인벤토리 버튼 */}
            <div className="flex items-center gap-4">
              {/* 사용자 잔액 표시 */}
              <div className="bg-amber-700 w-40 h-24 flex flex-col items-center justify-center rounded-xl border-4 border-amber-900 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)]">
                <h2 className="text-base font-bold text-white">내 포인트</h2>
                <p className="text-lg font-bold text-white">{userPoint} 🪙</p>
              </div>

              {/* 인벤토리로 이동 버튼 */}
              <button
                onClick={() => navigate('/inventory')}
                className="px-4 py-2 bg-[#B6977D] rounded-full text-white font-bold border-4 border-[#8B4513] shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-[#C19A6B] hover:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[1px] active:translate-x-[1px] transition-all flex items-center gap-2"
              >
                {/* 가방 아이콘 */}
                <span className="text-lg">🎒</span>
                <span>인벤토리</span>
              </button>

            </div>
        </div>



        {/* 아이템 목록 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg border-2 border-amber-200 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] flex flex-col items-center 
                        hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200"
            >
              {/* 아이템 이미지 */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg mb-2 border border-gray-300 
                          hover:scale-105 transition-transform duration-200"
              />
              {/* 아이템 이름 */}
              <h3 className="text-xs font-bold mb-1 text-center">{item.name}</h3>
              {/* 아이템 가격 */}
              <p className="text-xm font-bold text-gray-500 mb-2">{item.price} 🪙</p>
              {/* 구매 버튼 */}
              <button
                onClick={() => handlePurchase(item.id, item.price)}
                className="px-2 py-1 bg-green-500 rounded-full text-white font-bold text-xs border border-green-700 shadow-[2px_2px_0_rgba(0,0,0,0.3)] 
                          hover:bg-green-600 hover:shadow-none hover:-translate-y-[1px] hover:-translate-x-[1px] active:translate-y-[1px] active:translate-x-[1px] transition-all"
              >
                구매하기
              </button>
            </div>
          ))}
        </div>

        
        
        
      <div className='col-span-full flex justify-center mt-2'>
        {/* 페이지네이션 추가 */}
        <Pagination 
            page={page} 
            setPage={setPage} 
            totalPages={totalPages} 
        />
        </div>
        <button
          onClick={() => navigate('/')}
          className="fixed bottom-4 right-4 px-4 py-2 bg-amber-500 rounded-full text-white font-bold border-2 border-amber-700 shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-amber-600 hover:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[1px] active:translate-x-[1px] transition-all"
        >
          메인으로 돌아가기
        </button>
    </div>

  );
};

export default ShopPage;
