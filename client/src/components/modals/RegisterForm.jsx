import React, { useState } from 'react';
import styles from './AuthModal.module.css';

function RegisterForm({ onToggle, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }  else if (formData.name.length > 20) {    
    newErrors.name = 'Имя должно содержать не более 20 символов';
  }
    

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен быть не менее 8 символов';
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну цифру и один спецсимвол';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      if (onRegister) {
        onRegister(data.user);
      }
      onClose();
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formSection}>
      <h2 className={styles.formTitle}>Создать аккаунт</h2>
      <p className={styles.formSubtitle}>Присоединяйтесь чтобы помочь</p>
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Повторите пароль"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.confirmPassword && <div className={styles.errorMessage}>{errors.confirmPassword}</div>}
        </div>

        {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className={styles.toggleText}>
        Уже есть аккаунт?{' '}
        <span className={styles.toggleLink} onClick={onToggle}>
          Войти
        </span>
      </p>
    </div>
  );
}

export default RegisterForm;