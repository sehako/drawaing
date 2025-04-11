import ReactPaginate from 'react-paginate';

const Pagination: React.FC<{ 
  page: number; 
  setPage: (page: number) => void;
  totalPages: number;
}> = ({ page, setPage, totalPages }) => (
  <div className="mt-8 flex items-center justify-between gap-8">
    {/* 현재 페이지 표시 */}
    <div className="text-amber-700 font-bold">
      현재 페이지: {page + 1}
    </div>

    {/* 페이지네이션 */}
    <ReactPaginate
      previousLabel={'이전'}
      nextLabel={'다음'}
      breakLabel={'...'}
      pageCount={totalPages}
      marginPagesDisplayed={1}
      pageRangeDisplayed={3}
      onPageChange={({ selected }) => setPage(selected)}
      forcePage={page}
      containerClassName="flex justify-center gap-2"
      pageClassName="w-10 h-10 flex items-center justify-center border-2 border-amber-900 rounded-lg hover:bg-amber-100"
      pageLinkClassName="w-full h-full flex items-center justify-center"
      activeClassName="bg-amber-700 text-white border-amber-700"
      previousClassName="w-10 h-10 flex items-center justify-center border-2 border-amber-900 rounded-lg hover:bg-amber-100"
      nextClassName="w-10 h-10 flex items-center justify-center border-2 border-amber-900 rounded-lg hover:bg-amber-100"
    />
  </div>
);

export default Pagination;
