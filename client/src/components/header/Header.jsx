import styles from './Header.module.css';

function Header({ onOpenAuth, user, onCreateAd, onOpenProfile, onOpenAdminPanel, onOpenVolunteer, onOpenHelp, onLogout, onHome }) {
  return (
    <div className={styles.HeaderConteiner}>
      <div className={styles.ConteinerLeft}>
        <p className={styles.HeaderTxt} onClick={onOpenHelp}>Как можно помочь?</p>
        <p className={styles.HeaderTxt} onClick={onOpenVolunteer}>Станьте волонтером</p>
      </div>
      <div className={styles.ConteinerCenter}>
        <h1 className={styles.HeaderH1} onClick={onHome} style={{ cursor: 'pointer' }}>Лапа помощи</h1>
      </div>
      <div className={styles.ConteinerRight}>
        <button className={styles.btnCreate} onClick={onCreateAd}>
          Создать объявление
        </button>
        {user ? (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              {user.role === 'admin' ? (
                <button 
                  className={styles.adminButton} 
                  onClick={onOpenAdminPanel}
                  title="Панель администратора"
                >
                  <span>Админ панель</span>
                </button>
              ) : (
                <span className={styles.userName} onClick={onOpenProfile}>
                  {user.name}
                </span>
              )}
            </div>
          </div>
        ) : (
          <button className={styles.btnReg} onClick={onOpenAuth}>Войти</button>
        )}
      </div>
    </div>
  );
}

export default Header;