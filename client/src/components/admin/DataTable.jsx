import React from 'react';
import styles from './AdminPanel.module.css';

function DataTable({ columns, data, onAction }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px', color: '#AD9885' }}>
                Данные не найдены
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;