import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './AuthModal.module.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthModal({ isOpen, onClose, initialMode = 'login', onAuth }) {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  const handleToggle = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleAuth = (userData) => {
    if (onAuth) {
      onAuth(userData);
    }
  };

    const getImageUrl = (imageName) => {
    return `/${imageName}`;
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.modalContainer}>
          {mode === 'login' ? (
            <LoginForm onToggle={handleToggle} onClose={onClose} onLogin={handleAuth} />
          ) : (
            <RegisterForm onToggle={handleToggle} onClose={onClose} onRegister={handleAuth} />
          )}
          <div 
            className={styles.imageSection}
            style={{ 
              backgroundImage: `url(${getImageUrl(mode === 'login' ? 'auth.png' : 'reg.png')})`, 
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;