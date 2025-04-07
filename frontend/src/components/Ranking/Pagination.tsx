import React from 'react';
import ReactPaginate from 'react-paginate';

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ page, setPage, totalPages }) => {
  const handlePageChange = (selectedItem: { selected: number }) => {
    setPage(selectedItem.selected);
  };

  return (
    <ReactPaginate
      previousLabel={'이전'}
      nextLabel={'다음'}
      breakLabel={'...'}
      pageCount={totalPages}
      marginPagesDisplayed={1}
      pageRangeDisplayed={3}
      onPageChange={handlePageChange}
      containerClassName="flex justify-center items-center mt-6 space-x-2"
      pageClassName="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-200"
      activeClassName="bg-blue-500 text-white"
      previousClassName="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-200"
      nextClassName="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-blue-500 hover:text-white transition-all duration-200"
      disabledClassName="opacity-50 cursor-not-allowed"
    />
  );
};

export default Pagination;
