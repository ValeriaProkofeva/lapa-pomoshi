import React, { useState, useEffect } from 'react';
import styles from './Advertisements.module.css';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

function Advertisements({ user, onRequireAuth }) {

useEffect(() => {
  const handleOpenModal = () => {
    if (user) {
      setShowCreateModal(true);
    }
  };

  window.addEventListener('openCreateAdModal', handleOpenModal);
  return () => window.removeEventListener('openCreateAdModal', handleOpenModal);
}, [user]);

useEffect(() => {
  const handleRefresh = () => {
    loadAds();
  };

  window.addEventListener('refreshAdvertisements', handleRefresh);
  return () => window.removeEventListener('refreshAdvertisements', handleRefresh);
}, []);

  const [ads, setAds] = useState([]);
  const [filters, setFilters] = useState({
    animalType: '',
    status: '',
    breed: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAd, setNewAd] = useState({
    animalType: 'dog',
    status: 'lost',
    breed: '',
    city: '',
    description: '',
    photo: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAds();
  }, [filters, pagination.page]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: 10
      }).toString();

      const response = await fetch(`${API_BASE_URL}/api/advertisements?${queryParams}`, {
        credentials: 'include' 
      });
      const data = await response.json();

      if (response.ok) {
        setAds(data.advertisements);
        setPagination({
          ...pagination,
          total: data.total,
          totalPages: data.totalPages
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      animalType: '',
      status: '',
      breed: '',
      city: ''
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleCreateClick = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newAd)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании объявления');
      }

      setFormSuccess('Объявление успешно создано!');
      setTimeout(() => {
        setShowCreateModal(false);
        setNewAd({
          animalType: 'dog',
          status: 'lost',
          breed: '',
          city: '',
          description: '',
          photo: '',
          contactName: '',
          contactPhone: '',
          contactEmail: ''
        });
        loadAds(); 
      }, 2000);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAnimalTypeLabel = (type) => {
    const types = {
      cat: 'Кошка',
      dog: 'Собака',
      other: 'Другое'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      lost: 'Пропал',
      found: 'Найден'
    };
    return statuses[status] || status;
  };

  return (
    <div className={styles.advertisementsContainer}>
      <div className={styles.leftSection}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Тип животного</label>
            <select name="animalType" value={filters.animalType} onChange={handleFilterChange}>
              <option value="">Все</option>
              <option value="cat">Кошка</option>
              <option value="dog">Собака</option>
              <option value="other">Другое</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Статус</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Все</option>
              <option value="lost">Пропал</option>
              <option value="found">Найден</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Порода</label>
            <input
              type="text"
              name="breed"
              value={filters.breed}
              onChange={handleFilterChange}
              placeholder="Введите породу"
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Город</label>
            <input
              type="text"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Введите город"
            />
          </div>
          <button className={styles.clearFilters} onClick={clearFilters}>
            Сбросить фильтры
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Загрузка объявлений...</div>
        ) : ads.length === 0 ? (
          <div className={styles.noAds}>
            {Object.values(filters).some(v => v) ? 
              'По вашему запросу ничего не найдено' : 
              'Пока нет объявлений. Создайте первое объявление!'}
          </div>
        ) : (
          <>
            <div className={styles.adsGrid}>
              {ads.map(ad => (
                <div key={ad.id} className={styles.adCard}>
                  <div className={styles.adPhoto}>
                    {ad.photo ? (
                      <img src={ad.photo} alt="Фото животного" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '🐾'
                    )}
                  </div>
                  <div className={styles.adInfo}>
                    <div className={styles.adHeader}>
                      <span className={`${styles.adStatus} ${ad.status === 'lost' ? styles.statusLost : styles.statusFound}`}>
                        {getStatusLabel(ad.status)}
                      </span>
                      <span className={styles.adAnimalType}>{getAnimalTypeLabel(ad.animalType)}</span>
                    </div>
                    
                    <div className={styles.adDetails}>
                      {ad.breed && (
                        <div className={styles.adDetail}>
                          Порода: {ad.breed}
                        </div>
                      )}
                      <div className={styles.adDetail}>
                        {ad.city}
                      </div>
                    </div>

                    <div className={styles.adDescription}>
                      {ad.description}
                    </div>

                    <div className={styles.adContacts}>
                      <div className={styles.adContact}>
                        {ad.contactName}
                      </div>
                      <div className={styles.adContact}>
                        {ad.contactPhone}
                      </div>
                      {ad.contactEmail && (
                        <div className={styles.adContact}>
                          {ad.contactEmail}
                        </div>
                      )}
                    </div>

                    <div className={styles.adDate}>
                      {formatDate(ad.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  ←
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`${styles.pageButton} ${pagination.page === i + 1 ? styles.active : ''}`}
                    onClick={() => setPagination({ ...pagination, page: i + 1 })}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={styles.pageButton}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.rightSection}>
        <h2>Что делать, если вы нашли животное?</h2>
        
        <h3>1. Оцените состояние</h3>
        <p>Проверьте, нуждается ли животное в срочной ветеринарной помощи. Если да — сразу обратитесь к ветеринару.</p>
        
        <h3>2. Проверьте наличие чипа</h3>
        <p>Отведите животное в любую ветеринарную клинику для проверки на наличие чипа. Это поможет быстро найти хозяев.</p>
        
        <h3>3. Сделайте фото</h3>
        <p>Сфотографируйте животное с разных ракурсов. Это поможет в поиске хозяев.</p>
        
        <h3>4. Разместите объявление</h3>
        <p>Создайте объявление на нашем сайте. Укажите все детали: место находки, особые приметы, ваш контакт.</p>
        
        <h3>5. Распечатайте объявления</h3>
        <p>Разместите бумажные объявления в районе находки. Часто хозяева ищут питомца поблизости.</p>
        
        <h3>6. Временная передержка</h3>
        <p>Если нет возможности оставить животное у себя, поищите временный дом через волонтеров или найдите платную передержку.</p>
        
        <h3>Важно!</h3>
        <p>Не отдавайте животное без проверки документов и фотографий. Попросите показать фото питомца до пропажи — это поможет убедиться, что вы отдаете животное настоящим хозяевам.</p>
      </div>

      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowCreateModal(false)}>×</button>
            <h2>Создать объявление</h2>
            
            <form className={styles.createForm} onSubmit={handleCreateSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Тип животного *</label>
                  <select
                    value={newAd.animalType}
                    onChange={(e) => setNewAd({...newAd, animalType: e.target.value})}
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
                    value={newAd.status}
                    onChange={(e) => setNewAd({...newAd, status: e.target.value})}
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
                    value={newAd.breed}
                    onChange={(e) => setNewAd({...newAd, breed: e.target.value})}
                    placeholder="Например: такса"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Город *</label>
                  <input
                    type="text"
                    value={newAd.city}
                    onChange={(e) => setNewAd({...newAd, city: e.target.value})}
                    required
                    placeholder="Введите город"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Описание *</label>
                <textarea
                  value={newAd.description}
                  onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                  required
                  placeholder="Опишите животное, особые приметы, обстоятельства"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ссылка на фото</label>
                <input
                  type="url"
                  value={newAd.photo}
                  onChange={(e) => setNewAd({...newAd, photo: e.target.value})}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ваше имя *</label>
                  <input
                    type="text"
                    value={newAd.contactName}
                    onChange={(e) => setNewAd({...newAd, contactName: e.target.value})}
                    required
                    placeholder="Как к вам обращаться"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    value={newAd.contactPhone}
                    onChange={(e) => setNewAd({...newAd, contactPhone: e.target.value})}
                    required
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={newAd.contactEmail}
                  onChange={(e) => setNewAd({...newAd, contactEmail: e.target.value})}
                  placeholder="example@mail.com"
                />
              </div>

              {formError && <div className={styles.errorMessage}>{formError}</div>}
              {formSuccess && <div className={styles.successMessage}>{formSuccess}</div>}

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? 'Создание...' : 'Создать объявление'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Advertisements;