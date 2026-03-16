import React from 'react';
import styles from './AdminPanel.module.css';

function StatCards({ stats }) {
  return (
    <div className={styles.statsGrid} style={{ marginBottom: '20px' }}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statValue}>{stat.value}</div>
          <div className={styles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;