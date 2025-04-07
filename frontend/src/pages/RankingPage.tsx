import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RankingList from '../components/Ranking/RankingList';
import Pagination from '../components/Ranking/Pagination';
import CategoryFilter from '../components/Ranking/CategoryFilter';
import { Ranking } from '../types/RankingTypes';

const RankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [category, setCategory] = useState<string>('SCORE');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    fetchRankings();
  }, [category, page]);

  const fetchRankings = async () => {
    try {
      const response = await axios.get('https://www.drawaing.site/service/auth/api/v1/ranking', {
        params: { type: category, page, size: 10 },
      });
      console.log(response.data.data);
      setRankings(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  return (
    <div>
      <h1>랭킹</h1>
      <CategoryFilter category={category} setCategory={setCategory} />
      <RankingList 
        rankings={rankings} 
        page={page} 
        pageSize={10} // API 호출 시 사용하는 size 값과 일치해야 함
      />
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
};

export default RankingPage;
