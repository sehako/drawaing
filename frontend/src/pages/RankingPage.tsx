import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RankingList from '../components/Ranking/RankingList';
import Pagination from '../components/Ranking/Pagination';
import CategoryTabs from '../components/Ranking/CategoryTabs';
import { Ranking } from '../types/RankingTypes';
import { UserRanking } from '../types/RankingTypes';
import UserRankBadge from '../components/Ranking/UserRankBadge';
import Podium from '../components/Ranking/Podium';
import { useNavigate } from 'react-router-dom';

const RankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [userRank, setUserRank] = useState<UserRanking | null>(null);
  const [category, setCategory] = useState<string>('SCORE');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [top3Rankings, setTop3Rankings] = useState<Ranking[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchRankings();
      await fetchUserRank();
    };
    fetchData();
  }, [category, page]);

  function getUserFromLocalStorage() {
    // localStorage에서 'user' 데이터 가져오기
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // JSON 문자열을 객체로 변환
      return JSON.parse(userData);
    } else {
      console.error('localStorage에 "user" 데이터가 없습니다.');
      return null;
    }
  }

  const fetchRankings = async () => {
    try {
      const response = await axios.get('https://www.drawaing.site/service/auth/api/v1/ranking', {
        params: { type: category, page, size: 5 },
      });
      setRankings(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
      // Top3 랭킹
      const Top3Response = await axios.get('https://www.drawaing.site/service/auth/api/v1/ranking', {
        params: { type: category, page: 0, size: 3 },
      });
      setTop3Rankings(Top3Response.data.data.content);
    } catch (error) {
      console.error('랭킹 조회 오류:', error);
    }
  };

  const fetchUserRank = async () => {
    try {
      const user = getUserFromLocalStorage();
      const response = await axios.get(`https://www.drawaing.site/service/auth/api/v1/ranking/${user.memberId}`, {
        params: { type: category },
      });
      const userRanking: UserRanking = {
        nickname: user.nickname,
        characterImage: user.characterImage,
        rank: response.data.data.rank,
        value: response.data.data.value,
      };
      setUserRank(userRanking);
      console.log('내 랭킹:', userRanking);
    } catch (error) {
      console.error('개인 랭킹 조회 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      {/* 나무 판자 헤더 */}
      <div className="relative bg-amber-800 rounded-xl p-6 mb-8 border-4 border-amber-900 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-amber-900/10 rounded-xl" />
        <h1 className="text-4xl font-bold text-center text-amber-100 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          🏆 RANKING
        </h1>
      </div>


      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 메인 컨텐츠 */}
      <div className="flex-grow">
        <CategoryTabs category={category} setCategory={setCategory} />
        <RankingList 
          rankings={rankings} 
          page={page}
          pageSize={5}
        />
        {/* 페이지네이션 */}
        <div className="flex justify-center mt-4">
          <Pagination 
            page={page} 
            setPage={setPage} 
            totalPages={totalPages} 
          />
        </div>
      </div>

        {/* 사이드 패널 */}
        <div className="lg:w-80 space-y-8">
          <UserRankBadge userRank={userRank} />
          <Podium rankings={top3Rankings} />
        </div>

        <button
          onClick={() => navigate('/')}
          className="fixed bottom-4 right-4 px-4 py-2 bg-amber-500 rounded-full text-white font-bold border-2 border-amber-700 shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:bg-amber-600 hover:shadow-none hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[1px] active:translate-x-[1px] transition-all"
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default RankingPage;
