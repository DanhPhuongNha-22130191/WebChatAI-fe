import React from 'react';
import styles from './Pagination.module.css';

/**
 * Reusable Pagination component with premium aesthetics and sliding window logic.
 * @param {Object} props
 * @param {number} props.page - Current active page (0-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback when active page changes (receives new 0-indexed page number)
 */
export default function Pagination({ page = 0, totalPages = 0, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1 (index 0)
      pages.push(0);

      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);

      // Adjust start/end to ensure we show a stable number of buttons around the current page
      if (page <= 2) {
        end = 3;
      } else if (page >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      // Always include the last page (index totalPages - 1)
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.pagination} id="shared-pagination">
      <button
        className={styles.pageBtn}
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        id="pagination-prev"
      >
        ← Trước
      </button>

      {pageNumbers.map((p, idx) => {
        if (typeof p === 'string') {
          return (
            <span key={`${p}-${idx}`} className={styles.ellipsis}>
              …
            </span>
          );
        }
        return (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === page ? styles.pageActive : ''}`}
            onClick={() => onPageChange(p)}
            id={`pagination-page-${p}`}
          >
            {p + 1}
          </button>
        );
      })}

      <button
        className={styles.pageBtn}
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        id="pagination-next"
      >
        Sau →
      </button>
    </div>
  );
}
