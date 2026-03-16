import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

function Profile({ user, onLogout, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [myAds, setMyAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [myTasks, setMyTasks] = useState({ 
    data: [], 
    pagination: { page: 1, totalPages: 1, total: 0 }, 
    stats: null 
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskStatusComment, setTaskStatusComment] = useState('');
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [tasksPagination, setTasksPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  const [isVolunteer, setIsVolunteer] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    city: '',
    telegram: '',
    vk: '',
    whatsapp: '',
    notificationsEnabled: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [editingAd, setEditingAd] = useState(null);
  const [showEditAdModal, setShowEditAdModal] = useState(false);
  const [editAdForm, setEditAdForm] = useState({
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

  useEffect(() => {
    loadProfile();
    loadMyAds();
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks' && isVolunteer) {
      loadMyTasks();
    }
  }, [activeTab, tasksPagination.page, isVolunteer]);

  useEffect(() => {
    if (isVolunteer) {
      loadMyTasks();
    }
  }, [isVolunteer]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('Данные профиля с сервера:', data); 
      
      if (response.ok) {
        setProfile(data);
        
        const hasVolunteer = !!(
          data.volunteer || 
          data.Volunteer || 
          (data.Profile && data.Profile.volunteer) ||
          (data.Profile && data.Profile.Volunteer)
        );
        
        console.log('Является волонтером:', hasVolunteer);
        setIsVolunteer(hasVolunteer);
        
        setProfileForm({
          name: data.name || '',
          bio: data.Profile?.bio || '',
          phone: data.Profile?.phone || '',
          city: data.Profile?.city || '',
          telegram: data.Profile?.telegram || '',
          vk: data.Profile?.vk || '',
          whatsapp: data.Profile?.whatsapp || '',
          notificationsEnabled: data.Profile?.notificationsEnabled !== false
        });
        setAvatarPreview(data.Profile?.avatar);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyAds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/advertisements`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setMyAds(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки объявлений:', error);
    }
  };

  const loadMyTasks = async () => {
    try {
      console.log('Загрузка задач для волонтера...');
       const response = await fetch(`${API_BASE_URL}/api/tasks/my?page=${tasksPagination.page}&limit=5`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Задачи волонтера:', data);
      
      if (response.ok) {
        setMyTasks({
          data: data.tasks || [],
          pagination: data.pagination || { page: 1, totalPages: 1, total: 0 },
          stats: data.stats || { pending: 0, in_progress: 0, completed: 0, total: 0 }
        });
        setTasksPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      } else {
        console.error('Ошибка загрузки задач:', data.error);
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: newStatus,
          comment: taskStatusComment 
        })
      });
      
      if (response.ok) {
        setShowTaskDetailModal(false);
        setSelectedTask(null);
        setTaskStatusComment('');
        loadMyTasks();
        setSuccess('Статус задачи обновлен');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при обновлении статуса');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Файл слишком большой. Максимальный размер 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Можно загружать только изображения');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        handleAvatarUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async (avatarDataUrl) => {
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...profileForm,
          avatar: avatarDataUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке аватара');
      }

      setSuccess('Аватар успешно обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...profileForm,
          avatar: avatarPreview || profile?.Profile?.avatar
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении профиля');
      }

      setSuccess('Профиль успешно обновлен');
      loadProfile();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при изменении пароля');
      }

      setSuccess('Пароль успешно изменен');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setEditAdForm({
      animalType: ad.animalType,
      status: ad.status,
      breed: ad.breed || '',
      city: ad.city,
      description: ad.description,
      photo: ad.photo || '',
      contactName: ad.contactName,
      contactPhone: ad.contactPhone,
      contactEmail: ad.contactEmail || ''
    });
    setShowEditAdModal(true);
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/advertisements/${editingAd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editAdForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении объявления');
      }

      setSuccess('Объявление успешно обновлено');
      setTimeout(() => {
        setShowEditAdModal(false);
        setEditingAd(null);
        loadMyAds();
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/advertisements/${adId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMyAds(myAds.filter(ad => ad.id !== adId));
        setSuccess('Объявление удалено');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Ошибка удаления объявления:', error);
      setError('Ошибка при удалении объявления');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Введите пароль для подтверждения');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при удалении аккаунта');
      }

      onLogout();
    } catch (error) {
      setError(error.message);
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusLabel = (s) => {
    const labels = { 
      lost: 'Пропал', 
      found: 'Найден', 
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Выполнено',
      cancelled: 'Отменено'
    };
    return labels[s] || s;
  };

  const getPriorityLabel = (p) => {
    const labels = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      urgent: 'Срочно'
    };
    return labels[p] || p;
  };

  const getTaskTypeLabel = (t) => {
    const labels = { 
      transport: 'Транспортировка', 
      foster: 'Передержка', 
      search: 'Поиск', 
      info: 'Распространение инфо', 
      money: 'Финансовая помощь',
      other: 'Другое' 
    };
    return labels[t] || t;
  };

  const getAnimalTypeLabel = (type) => {
    const types = { cat: 'Кошка', dog: 'Собака', other: 'Другое' };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    return date ? new Date(date).toLocaleDateString('ru-RU') : 'Н/Д';
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка профиля...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Личный кабинет</h1>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {avatarPreview || profile?.Profile?.avatar ? (
                <img
                  src={avatarPreview || profile?.Profile?.avatar}
                  alt="Avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              className={styles.avatarInput}
              onChange={handleAvatarChange}
              disabled={saving}
            />
            <label htmlFor="avatar" className={styles.changeAvatarBtn}>
              {saving ? 'Загрузка...' : 'Изменить фото'}
            </label>
          </div>

         <div className={styles.userInfo}>
            <div className={styles.userName}>{profile?.name}</div>
            <div className={styles.userEmail}>{profile?.email}</div>
            {profile?.role === 'admin' && (
              <div className={styles.userRole}>Администратор</div>
            )}
            {profile?.Volunteer && profile?.Volunteer?.status === 'approved' && (
              <div className={styles.userRole} style={{ backgroundColor: '#2e7d32' }}>Волонтер</div>
            )}
          </div>

          <div className={styles.userStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{myAds.length}</div>
              <div className={styles.statLabel}>Объявлений</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {myAds.filter(ad => ad.status === 'lost').length}
              </div>
              <div className={styles.statLabel}>Пропало</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>
                {myAds.filter(ad => ad.status === 'found').length}
              </div>
              <div className={styles.statLabel}>Найдено</div>
            </div>
          </div>

          <div className={styles.navMenu}>
            <button
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Личные данные
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
              Безопасность
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'myads' ? styles.active : ''}`}
              onClick={() => setActiveTab('myads')}
            >
              <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 9c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" />
              </svg>
              Мои объявления
            </button>

             {profile?.Volunteer && profile?.Volunteer?.status === 'approved' && (
              <button
                className={`${styles.navItem} ${activeTab === 'tasks' ? styles.active : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Мои задачи {myTasks.stats?.pending > 0 && `(${myTasks.stats.pending})`}
              </button>
            )}

            <button
              className={`${styles.navItem} ${styles.logoutNavItem}`}
              onClick={handleLogoutClick}
            >
              <svg viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Выйти из аккаунта
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          {activeTab === 'profile' && (
            <>
              <h2 className={styles.sectionTitle}>Личные данные</h2>
              <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Имя</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>О себе</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Расскажите немного о себе"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Телефон</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Город</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="Ваш город"
                    />
                  </div>
                </div>

                <h3 style={{ marginTop: '20px', color: '#5F4834' }}>Социальные сети</h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Telegram</label>
                    <input
                      type="text"
                      value={profileForm.telegram}
                      onChange={(e) => setProfileForm({ ...profileForm, telegram: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>VK</label>
                    <input
                      type="text"
                      value={profileForm.vk}
                      onChange={(e) => setProfileForm({ ...profileForm, vk: e.target.value })}
                      placeholder="vk.com/username"
                    />
                  </div>
                </div>


                <div className={styles.formGroup}>
                  <label className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      checked={profileForm.notificationsEnabled}
                      onChange={(e) => setProfileForm({ ...profileForm, notificationsEnabled: e.target.checked })}
                    />
                    Получать уведомления о новых объявлениях
                  </label>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <h2 className={styles.sectionTitle}>Безопасность</h2>
              <form className={`${styles.profileForm} ${styles.passwordForm}`} onSubmit={handlePasswordSubmit}>
                <div className={styles.formGroup}>
                  <label>Текущий пароль</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Новый пароль</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength="8"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Подтвердите новый пароль</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Изменение...' : 'Изменить пароль'}
                </button>
              </form>

              <div className={styles.dangerZone}>
                <h3 className={styles.dangerTitle}>Опасная зона</h3>
                <p style={{ marginBottom: '15px', color: '#5F4834' }}>
                  Удаление аккаунта приведет к безвозвратному удалению всех ваших данных и объявлений.
                </p>
                <button
                  className={styles.deleteButton}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Удалить аккаунт
                </button>
              </div>
            </>
          )}

          {activeTab === 'myads' && (
            <>
              <h2 className={styles.sectionTitle}>Мои объявления</h2>
              {myAds.length === 0 ? (
                <div className={styles.noAds}>
                  У вас пока нет объявлений. Создайте первое объявление!
                </div>
              ) : (
                <div className={styles.myAds}>
                  {myAds.map(ad => (
                    <div key={ad.id} className={styles.adCard}>
                      <div className={styles.adPhoto}>
                        {ad.photo ? (
                          <img src={ad.photo} alt="Фото" />
                        ) : (
                          '🐾'
                        )}
                      </div>
                      <div className={styles.adInfo}>
                        <div className={styles.adHeader}>
                          <span className={`${styles.adStatus} ${ad.status === 'lost' ? styles.statusLost : styles.statusFound}`}>
                            {getStatusLabel(ad.status)}
                          </span>
                          <span className={styles.adTitle}>
                            {getAnimalTypeLabel(ad.animalType)} {ad.breed && `• ${ad.breed}`}
                          </span>
                        </div>
                        <div className={styles.adDetails}>
                          <span>📍 {ad.city}</span>
                          <span>📅 {formatDate(ad.createdAt)}</span>
                        </div>
                        <p style={{ color: '#5F4834', marginBottom: '10px' }}>{ad.description}</p>
                        <div className={styles.adActions}>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEditAd(ad)}
                          >
                            Редактировать
                          </button>
                          <button
                            className={styles.deleteAdButton}
                            onClick={() => handleDeleteAd(ad.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

                    {activeTab === 'tasks' && (
            <>
              <h2 className={styles.sectionTitle}>Мои задачи</h2>
              
              {myTasks.stats && (
                <div className={styles.tasksStats}>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{myTasks.stats.pending || 0}</div>
                    <div className={styles.statLabel}>В ожидании</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{myTasks.stats.in_progress || 0}</div>
                    <div className={styles.statLabel}>В работе</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statValue}>{myTasks.stats.completed || 0}</div>
                    <div className={styles.statLabel}>Выполнено</div>
                  </div>
                </div>
              )}
              
              <div className={styles.tasksList}>
                {myTasks.data.length === 0 ? (
                  <div className={styles.noAds}>
                    У вас пока нет задач. Когда администратор назначит вам задачу, она появится здесь.
                  </div>
                ) : (
                  myTasks.data.map(task => (
                    <div key={task.id} className={styles.taskCard}>
                      <div className={styles.taskHeader}>
                        <h3>{task.title}</h3>
                        <span className={`${styles.taskStatus} ${
                          task.status === 'pending' ? styles.statusPending :
                          task.status === 'in_progress' ? styles.statusActive :
                          task.status === 'completed' ? styles.statusSuccess :
                          styles.statusInactive
                        }`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      <p className={styles.taskDescription}>{task.description}</p>
                      <div className={styles.taskMeta}>
                        <span>📋 {getTaskTypeLabel(task.taskType)}</span>
                        <span>⚡ {getPriorityLabel(task.priority)}</span>
                        {task.deadline && <span>⏰ {formatDateShort(task.deadline)}</span>}
                      </div>
                      {task.location && (
                        <div className={styles.taskLocation}>
                          📍 {task.location}
                        </div>
                      )}
                      <button 
                        className={styles.viewTaskButton}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        Подробнее
                      </button>
                    </div>
                  ))
                )}
              </div>

              {tasksPagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageButton}
                    onClick={() => setTasksPagination({...tasksPagination, page: tasksPagination.page - 1})}
                    disabled={tasksPagination.page === 1}
                  >
                    ←
                  </button>
                  <span className={styles.pageInfo}>
                    {tasksPagination.page} из {tasksPagination.totalPages}
                  </span>
                  <button
                    className={styles.pageButton}
                    onClick={() => setTasksPagination({...tasksPagination, page: tasksPagination.page + 1})}
                    disabled={tasksPagination.page === tasksPagination.totalPages}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Модалка деталей задачи */}
      {showTaskDetailModal && selectedTask && (
        <div className={styles.modalOverlay} onClick={() => setShowTaskDetailModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowTaskDetailModal(false)}>×</button>
            <h2>Детали задачи</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#5F4834', marginBottom: '10px' }}>{selectedTask.title}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <div>
                  <p><strong>Тип задачи:</strong> {getTaskTypeLabel(selectedTask.taskType)}</p>
                  <p><strong>Приоритет:</strong> {getPriorityLabel(selectedTask.priority)}</p>
                  <p><strong>Статус:</strong> {getStatusLabel(selectedTask.status)}</p>
                </div>
                <div>
                  <p><strong>Дедлайн:</strong> {selectedTask.deadline ? formatDate(selectedTask.deadline) : 'Не указан'}</p>
                  <p><strong>Локация:</strong> {selectedTask.location || 'Не указана'}</p>
                  <p><strong>Создана:</strong> {formatDate(selectedTask.createdAt)}</p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4>Описание:</h4>
                <p style={{ color: '#5F4834', background: '#FFF8F2', padding: '15px', borderRadius: '8px' }}>
                  {selectedTask.description}
                </p>
              </div>

              {selectedTask.adminComment && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Комментарий администратора:</h4>
                  <p style={{ color: '#5F4834', background: '#FFF8F2', padding: '15px', borderRadius: '8px' }}>
                    {selectedTask.adminComment}
                  </p>
                </div>
              )}

              {selectedTask.Advertisement && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Связанное объявление:</h4>
                  <div style={{ background: '#FFF8F2', padding: '15px', borderRadius: '8px' }}>
                    <p><strong>ID:</strong> #{selectedTask.Advertisement.id}</p>
                    <p><strong>Тип:</strong> {getAnimalTypeLabel(selectedTask.Advertisement.animalType)}</p>
                    <p><strong>Статус:</strong> {getStatusLabel(selectedTask.Advertisement.status)}</p>
                    <p><strong>Город:</strong> {selectedTask.Advertisement.city}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedTask.status !== 'completed' && selectedTask.status !== 'cancelled' && (
              <div style={{ marginTop: '20px' }}>
                <h4>Изменить статус:</h4>
                <div className={styles.statusActions}>
                  {selectedTask.status === 'pending' && (
                    <button 
                      className={styles.startTaskButton}
                      onClick={() => handleTaskStatusUpdate(selectedTask.id, 'in_progress')}
                    >
                      Взять в работу
                    </button>
                  )}
                  
                  {selectedTask.status === 'in_progress' && (
                    <>
                      <textarea
                        placeholder="Опишите результаты выполнения задачи"
                        value={taskStatusComment}
                        onChange={(e) => setTaskStatusComment(e.target.value)}
                        className={styles.taskCommentInput}
                        rows="3"
                      />
                      <button 
                        className={styles.completeTaskButton}
                        onClick={() => handleTaskStatusUpdate(selectedTask.id, 'completed')}
                        disabled={!taskStatusComment}
                      >
                        Отметить как выполненное
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button 
                className={`${styles.modalButton} ${styles.cancelButton}`} 
                onClick={() => {
                  setShowTaskDetailModal(false);
                  setTaskStatusComment('');
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования объявления */}
      {showEditAdModal && editingAd && (
        <div className={styles.modalOverlay} onClick={() => setShowEditAdModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowEditAdModal(false)}>×</button>
            <h2>Редактирование объявления</h2>

            <form className={styles.editForm} onSubmit={handleUpdateAd}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Тип животного *</label>
                  <select
                    value={editAdForm.animalType}
                    onChange={(e) => setEditAdForm({ ...editAdForm, animalType: e.target.value })}
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
                    value={editAdForm.status}
                    onChange={(e) => setEditAdForm({ ...editAdForm, status: e.target.value })}
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
                    value={editAdForm.breed}
                    onChange={(e) => setEditAdForm({ ...editAdForm, breed: e.target.value })}
                    placeholder="Например: такса"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Город *</label>
                  <input
                    type="text"
                    value={editAdForm.city}
                    onChange={(e) => setEditAdForm({ ...editAdForm, city: e.target.value })}
                    required
                    placeholder="Введите город"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Описание *</label>
                <textarea
                  value={editAdForm.description}
                  onChange={(e) => setEditAdForm({ ...editAdForm, description: e.target.value })}
                  required
                  placeholder="Опишите животное, особые приметы, обстоятельства"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ссылка на фото</label>
                <input
                  type="url"
                  value={editAdForm.photo}
                  onChange={(e) => setEditAdForm({ ...editAdForm, photo: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ваше имя *</label>
                  <input
                    type="text"
                    value={editAdForm.contactName}
                    onChange={(e) => setEditAdForm({ ...editAdForm, contactName: e.target.value })}
                    required
                    placeholder="Как к вам обращаться"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    value={editAdForm.contactPhone}
                    onChange={(e) => setEditAdForm({ ...editAdForm, contactPhone: e.target.value })}
                    required
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={editAdForm.contactEmail}
                  onChange={(e) => setEditAdForm({ ...editAdForm, contactEmail: e.target.value })}
                  placeholder="example@mail.com"
                />
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={`${styles.modalButton} ${styles.cancelButton}`}
                  onClick={() => setShowEditAdModal(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`${styles.modalButton} ${styles.saveButton}`}
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления аккаунта */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowDeleteModal(false)}>×</button>
            <h3>Подтверждение удаления</h3>
            <p style={{ marginBottom: '20px', color: '#5F4834' }}>
              Для удаления аккаунта введите ваш пароль
            </p>
            <input
              type="password"
              placeholder="Пароль"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.modalActions}>
              <button
                className={`${styles.modalButton} ${styles.cancelButton}`}
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button
                className={`${styles.modalButton} ${styles.confirmButton}`}
                onClick={handleDeleteAccount}
                disabled={saving}
              >
                {saving ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;