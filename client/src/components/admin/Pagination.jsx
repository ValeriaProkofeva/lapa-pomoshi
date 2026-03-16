import React from 'react';
import styles from './AdminPanel.module.css';

function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      >
        ←
      </button>
      {[...Array(pagination.totalPages)].map((_, i) => (
        <button
          key={i + 1}
          className={`${styles.pageButton} ${pagination.page === i + 1 ? styles.active : ''}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
      >
        →
      </button>
    </div>
  );
}

export default Pagination;