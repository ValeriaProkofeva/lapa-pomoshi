import React from 'react';
import styles from './AdminPanel.module.css';

function TableFilters({ filters, onFilterChange, children }) {
  return (
    <div className={styles.filtersBar}>
      {children}
    </div>
  );
}

export function SearchFilter({ value, onChange, placeholder = "Поиск..." }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={styles.searchInput}
      value={value}
      onChange={(e) => onChange(e.target.value)} 
    />
  );
}

export function SelectFilter({ value, onChange, options, placeholder }) {
  return (
    <select
      className={styles.filterSelect}
      value={value}
      onChange={(e) => onChange(e.target.value)} 
      name={options.name}
    >
      <option value="">{placeholder}</option>
      {options.items.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default TableFilters;