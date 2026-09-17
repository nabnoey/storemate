type PaginationProps = {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, 5);
    } else if (currentPage + 2 >= totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-10 text-xl font-medium text-black">
      <button
        data-test="click-prev"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center hover:bg-blue-600/20 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
      >
        &lt;
      </button>

      {getPageNumbers().map((page) => (
        <button
          data-test="click-on-page"
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            currentPage === page
              ? "text-blue-500 font-bold bg-blue-50"
              : "hover:bg-blue-600/20"
          }`}
        >
          {page}
        </button>
      ))}

      {totalPages > 5 && currentPage < totalPages - 2 && (
        <>
          <span className="px-1 text-black">...</span>
          <button
            data-test="click-total-page"
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center hover:bg-blue-600/20 rounded-md transition-colors cursor-pointer"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* ปุ่ม > */}
      <button
        data-test="click-next"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center hover:bg-blue-600/20 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  );
}
