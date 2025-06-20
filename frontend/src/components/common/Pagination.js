import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // Calculate the range of page numbers to display
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // Ensure we always show 5 page numbers if possible
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(5, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }
  }
  
  // Generate page numbers
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`pagination-item ${
          currentPage === 1 ? 'pagination-disabled' : 'hover:bg-gray-200'
        }`}
      >
        First
      </button>
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`pagination-item ${
          currentPage === 1 ? 'pagination-disabled' : 'hover:bg-gray-200'
        }`}
      >
        Prev
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`pagination-item ${
            currentPage === number ? 'pagination-active' : 'hover:bg-gray-200'
          }`}
        >
          {number}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`pagination-item ${
          currentPage === totalPages ? 'pagination-disabled' : 'hover:bg-gray-200'
        }`}
      >
        Next
      </button>
      
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`pagination-item ${
          currentPage === totalPages ? 'pagination-disabled' : 'hover:bg-gray-200'
        }`}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
