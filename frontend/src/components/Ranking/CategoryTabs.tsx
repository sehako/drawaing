import React from 'react';

const categories = [
  { type: 'SCORE', label: '랭킹 점수', emoji: '🎯' },
  { type: 'PLAY', label: '플레이 횟수', emoji: '🎮' },
  { type: 'POINT', label: '포인트', emoji: '💰' },
  { type: 'LEVEL', label: '레벨', emoji: '📈' },
];

const CategoryTabs: React.FC<{ 
  category: string; 
  setCategory: (type: string) => void 
}> = ({ category, setCategory }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {categories.map((cat) => (
      <button
        key={cat.type}
        onClick={() => setCategory(cat.type)}
        className={`p-4 rounded-xl border-4 transition-all duration-300 ${
          category === cat.type 
            ? 'border-amber-900 bg-amber-700 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]' 
            : 'border-amber-200 bg-amber-100 hover:bg-amber-200'
        }`}
      >
        <div className="text-2xl mb-2">{cat.emoji}</div>
        <div className="font-bold">{cat.label}</div>
      </button>
    ))}
  </div>
);

export default CategoryTabs;
