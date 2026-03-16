import React, { useState } from 'react';
import styles from './Advertisements.module.css';

function CreateAdModal({ isOpen, onClose, user, onAdCreated }) {
  const [formData, setFormData] = useState({
    animalType: 'dog',
    status: 'lost',
    breed: '',
    city: '',
    description: '',
    photo: '',
    contactName: user?.name || '',
    contactPhone: '',
    contactEmail: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании объявления');
      }

      setSuccess('Объявление успешно создано!');
      
      // Сбрасываем форму
      setFormData({
        animalType: 'dog',
        status: 'lost',
        breed: '',
        city: '',
        description: '',
        photo: '',
        contactName: user?.name || '',
        contactPhone: '',
        contactEmail: user?.email || ''
      });

      // Уведомляем родительский компонент о создании объявления
      if (onAdCreated) {
        onAdCreated();
      }

      // Закрываем модалку через 2 секунды
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Создать объявление</h2>
        
        <form className={styles.createForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Тип животного *</label>
              <select
                name="animalType"
                value={formData.animalType}
                onChange={handleChange}
                required
              >
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Статус *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="lost">Пропал</option>
                <option value="found">Найден</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Порода</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="Например: такса"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Город *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Введите город"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Опишите животное, особые приметы, обстоятельства"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Ссылка на фото</label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ваше имя *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                placeholder="Как к вам обращаться"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Телефон *</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                placeholder="+7 (999) 123-45-67"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="example@mail.com"
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать объявление'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAdModal;