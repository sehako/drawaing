import React from 'react';

const categories = [
  { type: 'CHARACTER', label: '캐릭터', emoji: '🧙‍♂️' },
  { type: 'EMOTICON', label: '이모티콘', emoji: '😊' },
  { type: 'ITEM', label: '아이템', emoji: '🎁' },
  { type: 'ETC', label: '기타', emoji: '🌟' },
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
            ? 'border-green-900 bg-green-700 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]' 
            : 'border-green-200 bg-green-100 hover:bg-green-200'
        }`}
      >
        <div className="text-xl mb-2">{cat.emoji}</div>
        <div className="font-bold">{cat.label}</div>
      </button>
    ))}
  </div>
);

export default CategoryTabs;
