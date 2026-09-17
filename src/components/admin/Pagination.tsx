interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-sm">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`border border-gray-300 rounded-md px-4 py-1.5 font-medium transition-colors ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed border-gray-200"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        ก่อนหน้า
      </button>

      <div className="flex font-normal font-['Anuphan'] items-center gap-1">
        {visiblePages.length > 0 ? (
          visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-md flex items-center justify-center font-medium transition-colors ${
                page === currentPage
                  ? "text-blue-500 font-bold bg-transparent"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))
        ) : (
          <button type="button" className="w-8 h-8 text-blue-500 font-bold">1</button>
        )}
      </div>

      <button
        type="button"
        // disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
         className="border border-gray-300 rounded-md px-4 py-1.5 font-medium transition-colors text-gray-600 hover:bg-gray-50"
      >
        ต่อไป
      </button>
    </div>
  );
}