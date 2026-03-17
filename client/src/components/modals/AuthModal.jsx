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
              backgroundImage: `url(${mode === 'login' ? 'https://i.pinimg.com/1200x/39/bc/f2/39bcf20c9239da2177012986a6bf68f5.jpg' : 'https://i.pinimg.com/736x/5c/e9/53/5ce953a43cf792f17e094840abe647fe.jpg'})`, 
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;