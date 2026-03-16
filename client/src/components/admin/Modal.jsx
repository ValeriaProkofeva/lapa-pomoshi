import React from 'react';
import styles from './AdminPanel.module.css';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ onCancel, onSubmit, submitText = "Сохранить", disabled = false, isDelete = false }) {
  return (
    <div className={styles.modalActions}>
      <button type="button" className={`${styles.modalButton} ${styles.cancelButton}`} onClick={onCancel}>
        Отмена
      </button>
      <button 
        type="submit" 
        className={`${styles.modalButton} ${isDelete ? styles.deleteConfirmButton : styles.saveButton}`}
        disabled={disabled}
      >
        {submitText}
      </button>
    </div>
  );
}

export default Modal;