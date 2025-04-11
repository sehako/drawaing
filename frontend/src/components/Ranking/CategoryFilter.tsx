import React from 'react';

interface CategoryFilterProps {
  category: string;
  setCategory: (category: string) => void;
}

const categories = ['SCORE', 'PLAY', 'POINT', 'LEVEL'];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ category, setCategory }) => {
  return (
    <div className="flex flex-col items-center mb-6">
      <label className="text-lg font-bold mb-2 text-gray-700">카테고리 선택:</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-64 p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
