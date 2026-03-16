import React, { useState, useEffect } from 'react';
import styles from './VolunteerPage.module.css';

function VolunteerPage({ user, onOpenAuth, onClose }) {
  const [loading, setLoading] = useState(true);
  const [volunteerInfo, setVolunteerInfo] = useState(null);
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [formData, setFormData] = useState({
    experience: '',
    helpTypes: [],
    availability: 'anytime',
    hasTransport: false,
    canFoster: false,
    fosterConditions: '',
    region: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadVolunteerInfo();
    if (user) {
      loadVolunteerStatus();
    }
  }, [user]);

  const loadVolunteerInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/volunteers/info');
      const data = await response.json();
      if (response.ok) {
        setVolunteerInfo(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/volunteers/status', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setVolunteerStatus(data);
        if (data.data) {
          setFormData({
            experience: data.data.experience || '',
            helpTypes: data.data.helpTypes || [],
            availability: data.data.availability || 'anytime',
            hasTransport: data.data.hasTransport || false,
            canFoster: data.data.canFoster || false,
            fosterConditions: data.data.fosterConditions || '',
            region: data.data.region || ''
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса:', error);
    }
  };

  const handleHelpTypeChange = (type) => {
    setFormData(prev => {
      const newHelpTypes = prev.helpTypes.includes(type)
        ? prev.helpTypes.filter(t => t !== type)
        : [...prev.helpTypes, type];
      return { ...prev, helpTypes: newHelpTypes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/volunteers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке заявки');
      }

      setSuccess('Заявка успешно отправлена! Ожидайте подтверждения администратора.');
      setFormData({
        experience: '',
        helpTypes: [],
        availability: 'anytime',
        hasTransport: false,
        canFoster: false,
        fosterConditions: '',
        region: ''
      });
      loadVolunteerStatus();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getHelpTypeLabel = (type) => {
    const labels = {
      transport: 'Транспортировка',
      foster: 'Передержка',
      search: 'Поиск пропавших',
      info: 'Распространение информации',
      money: 'Финансовая помощь'
    };
    return labels[type] || type;
  };

  const getAvailabilityLabel = (availability) => {
    const labels = {
      weekdays: 'В будни',
      weekends: 'В выходные',
      anytime: 'В любое время'
    };
    return labels[availability] || availability;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  const getStatusTitle = (status) => {
    switch(status) {
      case 'approved': return 'Вы волонтер!';
      case 'rejected': return 'Заявка отклонена';
      case 'pending': return 'Заявка на рассмотрении';
      default: return 'Статус не определен';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved': 
        return 'Поздравляем! Ваша заявка одобрена. Теперь вы можете участвовать в волонтерских миссиях.';
      case 'rejected': 
        return 'К сожалению, ваша заявка была отклонена. Вы можете подать заявку снова через 30 дней.';
      case 'pending': 
        return 'Ваша заявка находится на рассмотрении у администратора. Обычно это занимает 1-3 рабочих дня.';
      default: 
        return 'Заполните форму ниже, чтобы стать волонтером.';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <>
    <title>Станьте волонтером</title>
    <div className={styles.volunteerContainer}>
      <div className={styles.volunteerHeader}>
        <h1>Станьте волонтером</h1>
      </div>

      <div className={styles.volunteerContent}>
        <div className={styles.infoSection}>
          <h2>Кто такие волонтеры?</h2>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{volunteerInfo?.volunteersCount || 0}</div>
              <div className={styles.statLabel}>Активных волонтеров</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{volunteerInfo?.completedMissions || 0}</div>
              <div className={styles.statLabel}>Выполненных миссий</div>
            </div>
          </div>

          <p style={{ color: '#5F4834', lineHeight: '1.8', marginBottom: '20px' }}>
            Волонтеры "Лапы помощи" - это люди с большим сердцем, которые готовы помогать животным, 
            оказавшимся в беде. Наши волонтеры занимаются поиском пропавших питомцев, организацией 
            передержки, транспортировкой животных к ветеринарам и распространением информации о 
            потерянных и найденных животных.
          </p>

          <h3 style={{ color: '#5F4834', marginBottom: '15px' }}>Чем вы можете помочь?</h3>
          
          <div className={styles.helpTypesGrid}>
            {volunteerInfo?.helpTypes?.map(type => (
              <div key={type.id} className={styles.helpTypeCard}>
                <div className={styles.helpTypeTitle}>{type.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Регистрация волонтера</h2>

          {!user ? (
            <div className={styles.authWarning}>
              <p>Для регистрации в качестве волонтера необходимо войти в систему</p>
              <button className={styles.authButton} onClick={onOpenAuth}>
                Войти или зарегистрироваться
              </button>
            </div>
          ) : volunteerStatus?.isVolunteer ? (
            <div className={styles.statusMessage}>
              <div className={styles.statusIcon}>{getStatusIcon(volunteerStatus.status)}</div>
              <h3 className={styles.statusTitle}>{getStatusTitle(volunteerStatus.status)}</h3>
              <p className={styles.statusText}>{getStatusText(volunteerStatus.status)}</p>
              
              {volunteerStatus.status === 'approved' && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                  <h4 style={{ color: '#5F4834', marginBottom: '10px' }}>Ваши данные:</h4>
                  <p><strong>Регион:</strong> {volunteerStatus.data.region}</p>
                  <p><strong>Доступность:</strong> {getAvailabilityLabel(volunteerStatus.data.availability)}</p>
                  <p><strong>Виды помощи:</strong> {volunteerStatus.data.helpTypes.map(getHelpTypeLabel).join(', ')}</p>
                  {volunteerStatus.data.hasTransport && <p>Есть транспорт</p>}
                  {volunteerStatus.data.canFoster && <p>Могу взять на передержку</p>}
                  <p><strong>Выполнено миссий:</strong> {volunteerStatus.data.completedMissions}</p>
                  <p><strong>Рейтинг:</strong>  {volunteerStatus.data.rating}</p>
                </div>
              )}
            </div>
          ) : (
            <form className={styles.volunteerForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Виды помощи *</label>
                <div className={styles.checkboxGroup}>
                  {volunteerInfo?.helpTypes?.map(type => (
                    <label key={type.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.helpTypes.includes(type.id)}
                        onChange={() => handleHelpTypeChange(type.id)}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Доступность *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="availability"
                      value="weekdays"
                      checked={formData.availability === 'weekdays'}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    />
                    В будни
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="availability"
                      value="weekends"
                      checked={formData.availability === 'weekends'}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    />
                    В выходные
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="availability"
                      value="anytime"
                      checked={formData.availability === 'anytime'}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    />
                    В любое время
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Регион *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  placeholder="Например: Москва и МО"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Опыт волонтерства</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="Расскажите о своем опыте помощи животным, если есть"
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.hasTransport}
                    onChange={(e) => setFormData({...formData, hasTransport: e.target.checked})}
                  />
                  У меня есть машина (могу помогать с транспортировкой)
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.canFoster}
                    onChange={(e) => setFormData({...formData, canFoster: e.target.checked})}
                  />
                  Могу взять животное на передержку
                </label>
              </div>

              {formData.canFoster && (
                <div className={styles.formGroup}>
                  <label>Условия передержки</label>
                  <textarea
                    value={formData.fosterConditions}
                    onChange={(e) => setFormData({...formData, fosterConditions: e.target.value})}
                    placeholder="Опишите условия содержания: есть ли другие животные, есть ли отдельная комната и т.д."
                  />
                </div>
              )}

              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting || formData.helpTypes.length === 0 || !formData.region}
              >
                {submitting ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default VolunteerPage;