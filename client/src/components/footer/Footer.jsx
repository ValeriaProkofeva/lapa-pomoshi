import React from 'react';
import styles from './Footer.module.css';

function Footer({ onOpenHelp, onOpenVolunteer, onOpenAuth, onHome }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>О проекте</h3>
          <p>
            Лапа помощи — это платформа для поиска пропавших и найденных домашних животных. 
            Мы помогаем воссоединять питомцев с их хозяевами с 2024 года.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3>Навигация</h3>
          <ul>
            <li><a onClick={onHome}>Главная</a></li>
            <li><a onClick={onOpenHelp}>Как можно помочь?</a></li>
            <li><a onClick={onOpenVolunteer}>Стать волонтером</a></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Контакты</h3>
          <div className={styles.contactItem}>
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>help@lapapomoshi.ru</span>
          </div>
          <div className={styles.contactItem}>
            <svg viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>8 (800) 131-62-62</span>
          </div>
          <div className={styles.contactItem}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>Оренбург, ул. Чкалова, 1</span>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {currentYear} Лапа помощи. Все права защищены.</p>
      </div>
    </footer>
  );
}

export default Footer;