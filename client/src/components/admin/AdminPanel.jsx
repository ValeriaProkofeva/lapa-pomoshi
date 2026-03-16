import React, { useState, useEffect } from 'react';
import styles from './AdminPanel.module.css';
import TableFilters, { SearchFilter, SelectFilter } from './TableFilters';
import DataTable from './DataTable';
import Pagination from './Pagination';
import Modal, { ModalActions } from './Modal';
import StatCards from './StatCards';

function AdminPanel({ user, onClose, onLogout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteType, setDeleteType] = useState(null);
  const [saving, setSaving] = useState(false);


  const [users, setUsers] = useState({
    data: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    filters: { search: '', role: '', status: '' }
  });

  const [ads, setAds] = useState({
    data: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    filters: { search: '', status: '', animalType: '', city: '' }
  });

  const [volunteers, setVolunteers] = useState({
    data: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    filters: { search: '', status: '' },
    stats: null
  });

  const [tasks, setTasks] = useState({
    data: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    filters: { search: '', status: '', priority: '' },
    stats: null
  });

  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    volunteerId: '',
    title: '',
    description: '',
    taskType: 'transport',
    priority: 'medium',
    location: '',
    deadline: '',
    advertisementId: '',
    adminComment: ''
  });

  const [modals, setModals] = useState({
    user: false,
    ad: false,
    volunteer: false,
    task: false,
    delete: false,
    password: false,
    viewTask: false
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setLoading(false);
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, users.pagination.page, users.filters,
    ads.pagination.page, ads.filters,
    volunteers.pagination.page, volunteers.filters,
    tasks.pagination.page, tasks.filters]);

  const loadData = async () => {
    if (activeTab === 'users') await loadUsers();
    else if (activeTab === 'advertisements') await loadAdvertisements();
    else if (activeTab === 'volunteers') {
      await loadVolunteers();
      await loadVolunteerStats();
    } else if (activeTab === 'tasks') {
      await loadTasks();
      await loadTaskStats();
      await loadAvailableVolunteers();
    }
  };

  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, { credentials: 'include', ...options });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка запроса');
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const loadUsers = async () => {
    const params = new URLSearchParams({
      page: users.pagination.page,
      limit: 10,
      ...users.filters
    }).toString();

    const data = await apiCall(`http://localhost:5000/api/admin/users?${params}`);
    if (data) {
      setUsers(prev => ({
        ...prev,
        data: data.users,
        pagination: {
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        }
      }));
    }
  };

  const loadAdvertisements = async () => {
    const params = new URLSearchParams({
      page: ads.pagination.page,
      limit: 10,
      ...ads.filters
    }).toString();

    const data = await apiCall(`http://localhost:5000/api/admin/advertisements?${params}`);
    if (data) {
      setAds(prev => ({
        ...prev,
        data: data.advertisements,
        pagination: {
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        }
      }));
    }
  };

  const loadVolunteers = async () => {
    const params = new URLSearchParams({
      page: volunteers.pagination.page,
      limit: 10,
      ...volunteers.filters
    }).toString();

    const data = await apiCall(`http://localhost:5000/api/admin/volunteers?${params}`);
    if (data) {
      setVolunteers(prev => ({
        ...prev,
        data: data.volunteers,
        pagination: {
          page: data.page,
          totalPages: data.totalPages,
          total: data.total
        }
      }));
    }
  };

  const loadVolunteerStats = async () => {
    const data = await apiCall('http://localhost:5000/api/admin/volunteers/stats');
    if (data) {
      setVolunteers(prev => ({ ...prev, stats: data }));
    }
  };

  const loadTasks = async () => {
    const params = new URLSearchParams({
      page: tasks.pagination.page,
      limit: 10,
      ...tasks.filters
    }).toString();

    const data = await apiCall(`http://localhost:5000/api/admin/tasks?${params}`);
    if (data) {
      setTasks(prev => ({
        ...prev,
        data: data.tasks,
        pagination: data.pagination
      }));
    }
  };

  const loadTaskStats = async () => {
    const data = await apiCall('http://localhost:5000/api/admin/tasks?limit=1');
    if (data && data.stats) {
      setTasks(prev => ({ ...prev, stats: data.stats }));
    }
  };

  const loadAvailableVolunteers = async () => {
    const data = await apiCall('http://localhost:5000/api/admin/tasks/volunteers/available');
    if (data) {
      setAvailableVolunteers(data);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = await apiCall('http://localhost:5000/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskForm)
    });

    if (data) {
      setSuccess('Задача успешно создана');
      setShowTaskModal(false);
      setTaskForm({
        volunteerId: '',
        title: '',
        description: '',
        taskType: 'transport',
        priority: 'medium',
        location: '',
        deadline: '',
        advertisementId: '',
        adminComment: ''
      });
      loadTasks();
      loadTaskStats();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    const data = await apiCall(`http://localhost:5000/api/admin/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (data) {
      setSuccess('Задача обновлена');
      loadTasks();
      loadTaskStats();
      setModals(prev => ({ ...prev, task: false }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    console.log('Начинаем удаление задачи:', { taskId });
    setError('');
    setSuccess('');

    try {
      const url = `http://localhost:5000/api/admin/tasks/${taskId}`;
      console.log('Отправка DELETE запроса на:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Статус ответа:', response.status);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Данные ответа:', data);
      } else {
        const text = await response.text();
        console.log(' Текстовый ответ:', text);
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Ошибка HTTP: ${response.status}`);
      }

      console.log(' Задача удалена успешно:', data);
      setSuccess('Задача удалена');
      setModals(prev => ({ ...prev, delete: false }));
      setSelectedItem(null);
      loadTasks();
      loadTaskStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(' Ошибка при удалении задачи:', error);
      setError(error.message);
    }
  };

  const handleUpdate = async (url, body, callback) => {
    setError('');
    setSuccess('');
    const data = await apiCall(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (data) {
      setSuccess(data.message || 'Успешно обновлено');
      setTimeout(() => {
        callback();
        setSelectedItem(null);
      }, 1500);
    }
  };
  const handleDelete = async (url, callback) => {
    console.log(' Начинаем удаление:', { url });
    setError('');
    setSuccess('');

    try {
      console.log(' Отправка DELETE запроса на:', url);
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(' Статус ответа:', response.status);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Данные ответа:', data);
      } else {
        const text = await response.text();
        console.log('Текстовый ответ:', text);
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Ошибка HTTP: ${response.status}`);
      }

      console.log('Удаление успешно:', data);
      setModals(prev => ({ ...prev, delete: false }));
      setSelectedItem(null);
      callback();
      setSuccess('Удалено успешно');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      setError(error.message);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Н/Д';

  const formatDateShort = (date) => date ? new Date(date).toLocaleDateString('ru-RU') : 'Н/Д';

  const getStatusLabel = (s) => {
    const labels = {
      lost: 'Пропал',
      found: 'Найден',
      pending: 'Ожидает',
      in_progress: 'В работе',
      completed: 'Выполнено',
      cancelled: 'Отменено',
      approved: 'Одобрено',
      rejected: 'Отклонено'
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

  const getAnimalTypeLabel = (t) => {
    const types = { cat: 'Кошка', dog: 'Собака', other: 'Другое' };
    return types[t] || t;
  };

  const handleResetPassword = async () => {
    console.log('Начинаем сброс пароля для:', selectedItem?.name);
    console.log('Новый пароль:', newPassword);

    if (!selectedItem) {
      console.log('Нет выбранного пользователя');
      setError('Пользователь не выбран');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      console.log('Пароль слишком короткий');
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const url = `http://localhost:5000/api/admin/users/${selectedItem.id}/reset-password`;
      console.log('Отправка запроса на:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword })
      });

      console.log('Статус ответа:', response.status);

      const data = await response.json();
      console.log('Данные ответа:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сбросе пароля');
      }

      console.log('Пароль успешно сброшен');
      setSuccess('Пароль успешно сброшен');

      setModals(prev => ({ ...prev, password: false }));
      setNewPassword('');
      setSelectedItem(null);

      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error(' Ошибка сброса пароля:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getHelpTypeLabel = (t) => {
    const labels = {
      transport: 'Транспорт',
      foster: 'Передержка',
      search: 'Поиск',
      info: 'Инфо',
      money: 'Финансы'
    };
    return labels[t] || t;
  };

  const getAvailabilityLabel = (a) => {
    const labels = {
      weekdays: 'В будни',
      weekends: 'Выходные',
      anytime: 'Любое'
    };
    return labels[a] || a;
  };

  const userColumns = [
    { key: 'id', label: 'ID', render: (u) => `#${u.id}` },
    { key: 'name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Роль',
      render: (u) => (
        <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
          {u.role === 'admin' ? 'Админ' : 'Пользователь'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Статус',
      render: (u) => (
        <span className={`${styles.statusBadge} ${u.isActive ? styles.statusActive : styles.statusInactive}`}>
          {u.isActive ? 'Активен' : 'Неактивен'}
        </span>
      )
    },
    { key: 'createdAt', label: 'Дата', render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      label: 'Действия',
      render: (u) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => {
              setSelectedItem(u);
              setModals(prev => ({ ...prev, user: true }));
            }}
            title="Редактировать"
          >Ред.</button>
          <button
            className={styles.resetPasswordButton}
            onClick={() => {
              setSelectedItem(u);
              setModals(prev => ({ ...prev, password: true }));
            }}
            title="Сбросить пароль"
          >Сбросить пароль</button>
          <button
            className={styles.deleteButton}
            onClick={() => {
              setSelectedItem(u);
              setDeleteType('user');
              setModals(prev => ({ ...prev, delete: true }));
            }}
            disabled={u.id === 1}
            title={u.id === 1 ? "Нельзя удалить главного администратора" : "Удалить"}
          >Удалить</button>
        </div>
      )
    }
  ];

  const adColumns = [
    { key: 'id', label: 'ID', render: (a) => `#${a.id}` },
    { key: 'author', label: 'Автор', render: (a) => a.User?.name || 'Неизвестно' },
    { key: 'type', label: 'Тип', render: (a) => getAnimalTypeLabel(a.animalType) },
    {
      key: 'status',
      label: 'Статус',
      render: (a) => (
        <span className={`${styles.statusBadge} ${a.status === 'lost' ? styles.statusInactive : styles.statusActive}`}>
          {getStatusLabel(a.status)}
        </span>
      )
    },
    { key: 'breed', label: 'Порода', render: (a) => a.breed || '-' },
    { key: 'city', label: 'Город' },
    { key: 'createdAt', label: 'Дата', render: (a) => formatDate(a.createdAt) },
    {
      key: 'actions',
      label: 'Действия',
      render: (a) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => {
              setSelectedItem(a);
              setModals(prev => ({ ...prev, ad: true }));
            }}
            title="Редактировать"
          >Ред.</button>
          <button
            className={styles.deleteButton}
            onClick={() => {
              setSelectedItem(a);
              setDeleteType('ad');
              setModals(prev => ({ ...prev, delete: true }));
            }}
            title="Удалить"
          >Удалить</button>
        </div>
      )
    }
  ];

  const volunteerColumns = [
    { key: 'id', label: 'ID', render: (v) => `#${v.id}` },
    {
      key: 'user',
      label: 'Пользователь',
      render: (v) => (
        <>
          <div>{v.User?.name}</div>
          <small style={{ color: '#AD9885' }}>{v.User?.email}</small>
        </>
      )
    },
    { key: 'region', label: 'Регион' },
    { key: 'help', label: 'Помощь', render: (v) => v.helpTypes?.map(getHelpTypeLabel).join(', ') },
    { key: 'availability', label: 'Доступность', render: (v) => getAvailabilityLabel(v.availability) },
    {
      key: 'status',
      label: 'Статус',
      render: (v) => {
        let statusClass = styles.statusPending;
        if (v.status === 'approved') statusClass = styles.statusActive;
        if (v.status === 'rejected') statusClass = styles.statusInactive;

        return (
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {getStatusLabel(v.status)}
          </span>
        );
      }
    },
    { key: 'createdAt', label: 'Дата', render: (v) => formatDate(v.createdAt) },
    {
      key: 'actions',
      label: 'Действия',
      render: (v) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => {
              setSelectedItem(v);
              setModals(prev => ({ ...prev, volunteer: true }));
            }}
            title="Просмотреть"
          >Смотреть</button>
          <button
            className={styles.deleteButton}
            onClick={() => {
              setSelectedItem(v);
              setDeleteType('volunteer');
              setModals(prev => ({ ...prev, delete: true }));
            }}
            title="Удалить"
          >Удалить</button>
        </div>
      )
    }
  ];

  const taskColumns = [
    { key: 'id', label: 'ID', render: (t) => `#${t.id}` },
    { key: 'title', label: 'Название' },
    {
      key: 'volunteer',
      label: 'Волонтер',
      render: (t) => t.Volunteer?.User?.name || 'Неизвестно'
    },
    { key: 'taskType', label: 'Тип', render: (t) => getTaskTypeLabel(t.taskType) },
    {
      key: 'priority',
      label: 'Приоритет',
      render: (t) => {
        let priorityClass = '';
        if (t.priority === 'low') priorityClass = styles.statusPending;
        if (t.priority === 'medium') priorityClass = styles.statusActive;
        if (t.priority === 'high') priorityClass = styles.statusInactive;
        if (t.priority === 'urgent') priorityClass = styles.statusUrgent;

        return (
          <span className={`${styles.statusBadge} ${priorityClass}`}>
            {getPriorityLabel(t.priority)}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Статус',
      render: (t) => {
        let statusClass = styles.statusPending;
        if (t.status === 'in_progress') statusClass = styles.statusActive;
        if (t.status === 'completed') statusClass = styles.statusSuccess;
        if (t.status === 'cancelled') statusClass = styles.statusInactive;

        return (
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {getStatusLabel(t.status)}
          </span>
        );
      }
    },
    { key: 'deadline', label: 'Дедлайн', render: (t) => t.deadline ? formatDateShort(t.deadline) : '-' },
    {
      key: 'actions',
      label: 'Действия',
      render: (t) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => {
              setSelectedItem(t);
              setTaskForm({
                volunteerId: t.volunteerId,
                title: t.title,
                description: t.description,
                taskType: t.taskType,
                priority: t.priority,
                location: t.location || '',
                deadline: t.deadline ? t.deadline.split('T')[0] : '',
                advertisementId: t.advertisementId || '',
                adminComment: t.adminComment || ''
              });
              setEditingTask(t);
              setModals(prev => ({ ...prev, task: true }));
            }}
            title="Редактировать"
          >Ред.</button>
          <button
            className={styles.viewButton}
            onClick={() => {
              setSelectedItem(t);
              setModals(prev => ({ ...prev, viewTask: true }));
            }}
            title="Просмотреть"
          >Смотреть</button>
          <button
            className={styles.deleteButton}
            onClick={() => {
              setSelectedItem(t);
              setModals(prev => ({ ...prev, delete: true }));
            }}
            title="Удалить"
          >Удалить</button>
        </div>
      )
    }
  ];

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Панель администратора</h1>
        <div className={styles.headerActions}>
          <button className={styles.logoutButton} onClick={onLogout}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Выйти
          </button>
        </div>
      </div>

      <div className={styles.adminContent}>
        <div className={styles.sidebar}>
          <div className={styles.adminInfo}>
            <div className={styles.adminName}>{user?.name || 'Администратор'}</div>
            <div className={styles.adminEmail}>{user?.email || 'admin@example.com'}</div>
            <div className={styles.adminBadge}>Администратор</div>
          </div>

          <div className={styles.navMenu}>
            {[
              { id: 'users', label: 'Пользователи', count: users.pagination.total },
              { id: 'advertisements', label: 'Объявления', count: ads.pagination.total },
              { id: 'volunteers', label: 'Волонтеры', count: volunteers.pagination.total },
              { id: 'tasks', label: 'Задачи', count: tasks.pagination.total }
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ marginRight: '10px' }}>{tab.icon}</span>
                {tab.label} ({tab.count})
              </button>
            ))}

          </div>
        </div>

        <div className={styles.mainContent}>
          {activeTab === 'users' && (
            <>
              <h2 className={styles.sectionTitle}>Управление пользователями</h2>
              <TableFilters>
                <SearchFilter
                  value={users.filters.search}
                  onChange={(value) => setUsers(prev => ({
                    ...prev,
                    filters: { ...prev.filters, search: value, page: 1 }
                  }))}
                  placeholder="Поиск по имени или email"
                />
                <SelectFilter
                  value={users.filters.role}
                  onChange={(value) => setUsers(prev => ({
                    ...prev,
                    filters: { ...prev.filters, role: value, page: 1 }
                  }))}
                  options={{
                    name: 'role',
                    items: [
                      { value: 'user', label: 'Пользователь' },
                      { value: 'admin', label: 'Администратор' }
                    ]
                  }}
                  placeholder="Все роли"
                />
                <SelectFilter
                  value={users.filters.status}
                  onChange={(value) => setUsers(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: value, page: 1 }
                  }))}
                  options={{
                    name: 'status',
                    items: [
                      { value: 'active', label: 'Активные' },
                      { value: 'inactive', label: 'Неактивные' }
                    ]
                  }}
                  placeholder="Все статусы"
                />
              </TableFilters>
              <DataTable columns={userColumns} data={users.data} />
              <Pagination
                pagination={users.pagination}
                onPageChange={(page) => setUsers(prev => ({
                  ...prev,
                  pagination: { ...prev.pagination, page }
                }))}
              />
            </>
          )}

          {activeTab === 'advertisements' && (
            <>
              <h2 className={styles.sectionTitle}>Управление объявлениями</h2>
              <TableFilters>
                <SearchFilter
                  value={ads.filters.search}
                  onChange={(value) => setAds(prev => ({
                    ...prev,
                    filters: { ...prev.filters, search: value, page: 1 }
                  }))}
                  placeholder="Поиск по описанию, породе, городу"
                />
                <SelectFilter
                  value={ads.filters.status}
                  onChange={(value) => setAds(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: value, page: 1 }
                  }))}
                  options={{
                    name: 'status',
                    items: [
                      { value: 'lost', label: 'Пропал' },
                      { value: 'found', label: 'Найден' }
                    ]
                  }}
                  placeholder="Все статусы"
                />
                <SelectFilter
                  value={ads.filters.animalType}
                  onChange={(value) => setAds(prev => ({
                    ...prev,
                    filters: { ...prev.filters, animalType: value, page: 1 }
                  }))}
                  options={{
                    name: 'animalType',
                    items: [
                      { value: 'cat', label: 'Кошка' },
                      { value: 'dog', label: 'Собака' },
                      { value: 'other', label: 'Другое' }
                    ]
                  }}
                  placeholder="Все животные"
                />
                <input
                  type="text"
                  placeholder="Город"
                  className={styles.filterSelect}
                  value={ads.filters.city}
                  onChange={(e) => setAds(prev => ({
                    ...prev,
                    filters: { ...prev.filters, city: e.target.value, page: 1 }
                  }))}
                />
              </TableFilters>
              <DataTable columns={adColumns} data={ads.data} />
              <Pagination
                pagination={ads.pagination}
                onPageChange={(page) => setAds(prev => ({
                  ...prev,
                  pagination: { ...prev.pagination, page }
                }))}
              />
            </>
          )}

          {activeTab === 'volunteers' && (
            <>
              <h2 className={styles.sectionTitle}>Управление волонтерами</h2>
              {volunteers.stats && (
                <StatCards stats={[
                  { value: volunteers.stats.total, label: 'Всего' },
                  { value: volunteers.stats.pending, label: 'В ожидании' },
                  { value: volunteers.stats.approved, label: 'Одобрено' },
                  { value: volunteers.stats.rejected, label: 'Отклонено' }
                ]} />
              )}
              <TableFilters>
                <SearchFilter
                  value={volunteers.filters.search}
                  onChange={(value) => setVolunteers(prev => ({
                    ...prev,
                    filters: { ...prev.filters, search: value, page: 1 }
                  }))}
                  placeholder="Поиск по имени или email"
                />
                <SelectFilter
                  value={volunteers.filters.status}
                  onChange={(value) => setVolunteers(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: value, page: 1 }
                  }))}
                  options={{
                    name: 'status',
                    items: [
                      { value: 'pending', label: 'В ожидании' },
                      { value: 'approved', label: 'Одобрено' },
                      { value: 'rejected', label: 'Отклонено' }
                    ]
                  }}
                  placeholder="Все статусы"
                />
              </TableFilters>
              <DataTable columns={volunteerColumns} data={volunteers.data} />
              <Pagination
                pagination={volunteers.pagination}
                onPageChange={(page) => setVolunteers(prev => ({
                  ...prev,
                  pagination: { ...prev.pagination, page }
                }))}
              />
            </>
          )}

          {activeTab === 'tasks' && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Управление задачами</h2>
                <button
                  className={styles.createButton}
                  onClick={() => {
                    setEditingTask(null);
                    setTaskForm({
                      volunteerId: '',
                      title: '',
                      description: '',
                      taskType: 'transport',
                      priority: 'medium',
                      location: '',
                      deadline: '',
                      advertisementId: '',
                      adminComment: ''
                    });
                    setShowTaskModal(true);
                  }}
                >
                  + Создать задачу
                </button>
              </div>

              {tasks.stats && (
                <StatCards stats={[
                  { value: tasks.stats.pending, label: 'В ожидании' },
                  { value: tasks.stats.in_progress, label: 'В работе' },
                  { value: tasks.stats.completed, label: 'Выполнено' },
                  { value: tasks.stats.cancelled, label: 'Отменено' }
                ]} />
              )}

              <TableFilters>
                <SearchFilter
                  value={users.filters.search}
                  onChange={(value) => {
                    console.log('Поиск:', value); 
                    setUsers(prev => ({
                      ...prev,
                      filters: { ...prev.filters, search: value, page: 1 }
                    }));
                  }}
                  placeholder="Поиск по имени или email"
                />

                <SelectFilter
                  value={users.filters.role}
                  onChange={(value) => {
                    console.log('Роль:', value);
                    setUsers(prev => ({
                      ...prev,
                      filters: { ...prev.filters, role: value, page: 1 }
                    }));
                  }}
                  options={{
                    name: 'role',
                    items: [
                      { value: 'user', label: 'Пользователь' },
                      { value: 'admin', label: 'Администратор' }
                    ]
                  }}
                  placeholder="Все роли"
                />

                <SelectFilter
                  value={users.filters.status}
                  onChange={(value) => {
                    console.log('Статус:', value); 
                    setUsers(prev => ({
                      ...prev,
                      filters: { ...prev.filters, status: value, page: 1 }
                    }));
                  }}
                  options={{
                    name: 'status',
                    items: [
                      { value: 'active', label: 'Активные' },
                      { value: 'inactive', label: 'Неактивные' }
                    ]
                  }}
                  placeholder="Все статусы"
                />
              </TableFilters>

              <DataTable columns={taskColumns} data={tasks.data} />

              <Pagination
                pagination={tasks.pagination}
                onPageChange={(page) => setTasks(prev => ({
                  ...prev,
                  pagination: { ...prev.pagination, page }
                }))}
              />
            </>
          )}

        </div>
      </div>

      {showTaskModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTaskModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <button className={styles.closeButton} onClick={() => setShowTaskModal(false)}>×</button>
            <h2>{editingTask ? 'Редактирование задачи' : 'Создание новой задачи'}</h2>

            <form className={styles.editForm} onSubmit={editingTask ?
              (e) => {
                e.preventDefault();
                handleUpdateTask(editingTask.id, taskForm);
                setShowTaskModal(false);
              } :
              handleCreateTask
            }>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label>Волонтер *</label>
                  <select
                    value={taskForm.volunteerId}
                    onChange={(e) => setTaskForm({ ...taskForm, volunteerId: e.target.value })}
                    required
                  >
                    <option value="">Выберите волонтера</option>
                    {availableVolunteers.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.User?.name} ({v.region}) - {v.completedMissions} миссий
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Тип задачи *</label>
                  <select
                    value={taskForm.taskType}
                    onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value })}
                    required
                  >
                    <option value="transport">Транспортировка</option>
                    <option value="foster">Передержка</option>
                    <option value="search">Поиск</option>
                    <option value="info">Распространение информации</option>
                    <option value="money">Финансовая помощь</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Название задачи *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Краткое описание задачи"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Описание *</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Подробное описание задачи"
                  rows="4"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Приоритет</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочно</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Дедлайн</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Локация</label>
                  <input
                    type="text"
                    value={taskForm.location}
                    onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                    placeholder="Город, район, адрес"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ID объявления</label>
                  <input
                    type="text"
                    value={taskForm.advertisementId}
                    onChange={(e) => setTaskForm({ ...taskForm, advertisementId: e.target.value })}
                    placeholder="Если связано с объявлением"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Комментарий для волонтера</label>
                <textarea
                  value={taskForm.adminComment}
                  onChange={(e) => setTaskForm({ ...taskForm, adminComment: e.target.value })}
                  placeholder="Дополнительная информация для волонтера"
                  rows="3"
                />
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}

              <div className={styles.modalActions}>
                <button type="button" className={`${styles.modalButton} ${styles.cancelButton}`} onClick={() => setShowTaskModal(false)}>
                  Отмена
                </button>
                <button type="submit" className={`${styles.modalButton} ${styles.saveButton}`}>
                  {editingTask ? 'Сохранить изменения' : 'Создать задачу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {modals.viewTask && selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setModals(prev => ({ ...prev, viewTask: false }))}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setModals(prev => ({ ...prev, viewTask: false }))}>×</button>
            <h2>Детали задачи</h2>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#5F4834' }}>{selectedItem.title}</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <div>
                  <p><strong>ID задачи:</strong> #{selectedItem.id}</p>
                  <p><strong>Волонтер:</strong> {selectedItem.Volunteer?.User?.name}</p>
                  <p><strong>Email волонтера:</strong> {selectedItem.Volunteer?.User?.email}</p>
                  <p><strong>Тип задачи:</strong> {getTaskTypeLabel(selectedItem.taskType)}</p>
                  <p><strong>Приоритет:</strong> {getPriorityLabel(selectedItem.priority)}</p>
                </div>
                <div>
                  <p><strong>Статус:</strong> {getStatusLabel(selectedItem.status)}</p>
                  <p><strong>Дедлайн:</strong> {selectedItem.deadline ? formatDate(selectedItem.deadline) : 'Не указан'}</p>
                  <p><strong>Локация:</strong> {selectedItem.location || 'Не указана'}</p>
                  <p><strong>Создана:</strong> {formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4>Описание задачи:</h4>
                <p style={{ color: '#5F4834', background: '#FFF8F2', padding: '15px', borderRadius: '8px' }}>
                  {selectedItem.description}
                </p>
              </div>

              {selectedItem.adminComment && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Комментарий администратора:</h4>
                  <p style={{ color: '#5F4834', background: '#FFF8F2', padding: '15px', borderRadius: '8px' }}>
                    {selectedItem.adminComment}
                  </p>
                </div>
              )}

              {selectedItem.completedComment && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Комментарий волонтера при выполнении:</h4>
                  <p style={{ color: '#5F4834', background: '#FFF8F2', padding: '15px', borderRadius: '8px' }}>
                    {selectedItem.completedComment}
                  </p>
                </div>
              )}

              {selectedItem.completedAt && (
                <p style={{ marginTop: '20px' }}>
                  <strong>Выполнена:</strong> {formatDate(selectedItem.completedAt)}
                </p>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={`${styles.modalButton} ${styles.cancelButton}`}
                onClick={() => setModals(prev => ({ ...prev, viewTask: false }))}
              >
                Закрыть
              </button>
              <button
                className={`${styles.modalButton} ${styles.editButton}`}
                onClick={() => {
                  setModals(prev => ({ ...prev, viewTask: false }));
                  setTaskForm({
                    volunteerId: selectedItem.volunteerId,
                    title: selectedItem.title,
                    description: selectedItem.description,
                    taskType: selectedItem.taskType,
                    priority: selectedItem.priority,
                    location: selectedItem.location || '',
                    deadline: selectedItem.deadline ? selectedItem.deadline.split('T')[0] : '',
                    advertisementId: selectedItem.advertisementId || '',
                    adminComment: selectedItem.adminComment || ''
                  });
                  setEditingTask(selectedItem);
                  setShowTaskModal(true);
                }}
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={modals.user}
        onClose={() => setModals(prev => ({ ...prev, user: false }))}
        title="Редактирование пользователя"
      >
        <form className={styles.editForm} onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleUpdate(
            `http://localhost:5000/api/admin/users/${selectedItem.id}`,
            {
              name: formData.get('name'),
              email: formData.get('email'),
              role: formData.get('role'),
              isActive: formData.get('isActive') === 'true',

            },
            loadUsers
          );
        }}>
          {['name', 'email'].map(f => (
            <div className={styles.formGroup} key={f}>
              <label>{f === 'name' ? 'Имя' : 'Email'}</label>
              <input
                name={f}
                type={f === 'email' ? 'email' : 'text'}
                defaultValue={selectedItem?.[f]}
                required
              />
            </div>
          ))}
          <div className={styles.formGroup}>
            <label>Роль</label>
            <select name="role" defaultValue={selectedItem?.role}>
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Статус</label>
            <select name="isActive" defaultValue={selectedItem?.isActive}>
              <option value="true">Активен</option>
              <option value="false">Неактивен</option>
            </select>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          <ModalActions
            onCancel={() => setModals(prev => ({ ...prev, user: false }))}
            onSubmit={() => { }}
          />
        </form>
      </Modal>

      <Modal
        isOpen={modals.ad}
        onClose={() => setModals(prev => ({ ...prev, ad: false }))}
        title="Редактирование объявления"
      >
        <form className={styles.editForm} onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleUpdate(
            `http://localhost:5000/api/admin/advertisements/${selectedItem.id}`,
            {
              animalType: formData.get('animalType'),
              status: formData.get('status'),
              breed: formData.get('breed'),
              city: formData.get('city'),
              description: formData.get('description'),
              contactName: formData.get('contactName'),
              contactPhone: formData.get('contactPhone'),
              contactEmail: formData.get('contactEmail'),
              isActive: formData.get('isActive') === 'true'
            },
            loadAdvertisements
          );
        }}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Тип</label>
              <select name="animalType" defaultValue={selectedItem?.animalType}>
                <option value="cat">Кошка</option>
                <option value="dog">Собака</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Статус</label>
              <select name="status" defaultValue={selectedItem?.status}>
                <option value="lost">Пропал</option>
                <option value="found">Найден</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Порода</label>
              <input name="breed" defaultValue={selectedItem?.breed || ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Город</label>
              <input name="city" defaultValue={selectedItem?.city} required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Описание</label>
            <textarea name="description" defaultValue={selectedItem?.description} required />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Контакт</label>
              <input name="contactName" defaultValue={selectedItem?.contactName} required />
            </div>
            <div className={styles.formGroup}>
              <label>Телефон</label>
              <input name="contactPhone" defaultValue={selectedItem?.contactPhone} required />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input name="contactEmail" type="email" defaultValue={selectedItem?.contactEmail || ''} />
          </div>
          <div className={styles.formGroup}>
            <label>Активно</label>
            <select name="isActive" defaultValue={selectedItem?.isActive}>
              <option value="true">Да</option>
              <option value="false">Нет</option>
            </select>
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}
          <ModalActions
            onCancel={() => setModals(prev => ({ ...prev, ad: false }))}
            onSubmit={() => { }}
          />
        </form>
      </Modal>

      <Modal
        isOpen={modals.volunteer}
        onClose={() => setModals(prev => ({ ...prev, volunteer: false }))}
        title="Заявка волонтера"
      >
        <div style={{ marginBottom: '20px' }}>
          <h3>Информация</h3>
          <p><strong>Имя:</strong> {selectedItem?.User?.name}</p>
          <p><strong>Email:</strong> {selectedItem?.User?.email}</p>
          <p><strong>Телефон:</strong> {selectedItem?.User?.Profile?.phone || 'Не указан'}</p>
          <p><strong>Регион:</strong> {selectedItem?.region}</p>
          <p><strong>Доступность:</strong> {getAvailabilityLabel(selectedItem?.availability)}</p>
          <p><strong>Помощь:</strong> {selectedItem?.helpTypes?.map(getHelpTypeLabel).join(', ')}</p>
          {selectedItem?.hasTransport && <p>Есть транспорт</p>}
          {selectedItem?.canFoster && <p>Может взять на передержку</p>}
          {selectedItem?.fosterConditions && <p><strong>Условия:</strong> {selectedItem.fosterConditions}</p>}
          {selectedItem?.experience && <p><strong>Опыт:</strong> {selectedItem.experience}</p>}
        </div>
        <div className={styles.actionButtons} style={{ justifyContent: 'center' }}>
          {['approved', 'rejected', 'pending'].map(status => (
            <button
              key={status}
              className={styles.editButton}
              onClick={() => handleUpdate(
                `http://localhost:5000/api/admin/volunteers/${selectedItem.id}/status`,
                { status },
                () => {
                  loadVolunteers();
                  loadVolunteerStats();
                  setModals(prev => ({ ...prev, volunteer: false }));
                }
              )}
              disabled={selectedItem?.status === status}
              style={
                status === 'approved' ? { backgroundColor: '#2e7d32', color: 'white' } :
                  status === 'rejected' ? { backgroundColor: '#d32f2f', color: 'white' } :
                    {}
              }
            >
              {status === 'approved' ? 'Одобрить' :
                status === 'rejected' ? 'Отклонить' :
                  '⏳ В ожидание'}
            </button>
          ))}
        </div>
        <ModalActions
          onCancel={() => setModals(prev => ({ ...prev, volunteer: false }))}
          onSubmit={() => setModals(prev => ({ ...prev, volunteer: false }))}
          submitText="Закрыть"
        />
      </Modal>

      <Modal
        isOpen={modals.password}
        onClose={() => {
          setModals(prev => ({ ...prev, password: false }));
          setNewPassword('');
          setError('');
          setSaving(false);
        }}
        title="Сброс пароля"
      >
        <p style={{ marginBottom: '20px', color: '#5F4834' }}>
          Введите новый пароль для пользователя <strong>{selectedItem?.name}</strong>
        </p>
        <input
          type="password"
          placeholder="Новый пароль (минимум 8 символов)"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError('');
          }}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            border: `2px solid ${error ? '#d32f2f' : '#AD9885'}`,
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        {newPassword && newPassword.length < 8 && (
          <div style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '10px' }}>
            Пароль слишком короткий (минимум 8 символов)
          </div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={() => {
              setModals(prev => ({ ...prev, password: false }));
              setNewPassword('');
              setError('');
              setSaving(false);
            }}
          >
            Отмена
          </button>
          <button
            className={`${styles.modalButton} ${styles.saveButton}`}
            onClick={handleResetPassword}
            disabled={!newPassword || newPassword.length < 8 || saving}
          >
            {saving ? 'Сброс...' : 'Сбросить пароль'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modals.delete}
        onClose={() => {
          console.log('🔽 Закрытие модалки удаления');
          setModals(prev => ({ ...prev, delete: false }));
          setSelectedItem(null);
          setError('');
        }}
        title="Подтверждение удаления"
      >
        <p style={{ marginBottom: '20px', color: '#5F4834' }}>
          {activeTab === 'users' && selectedItem && `Удалить пользователя ${selectedItem.name}?`}
          {activeTab === 'volunteers' && 'Удалить заявку волонтера?'}
          {activeTab === 'advertisements' && 'Удалить объявление?'}
          {activeTab === 'tasks' && 'Удалить задачу?'}
          {' '}Действие необратимо.
        </p>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.modalActions}>
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={() => {
              console.log(' Отмена удаления');
              setModals(prev => ({ ...prev, delete: false }));
              setSelectedItem(null);
              setError('');
            }}
          >
            Отмена
          </button>
          <button
            className={`${styles.modalButton} ${styles.deleteConfirmButton}`}
            onClick={async () => {
              console.log(' Нажата кнопка подтверждения удаления');
              console.log(' Текущий activeTab:', activeTab);
              console.log(' selectedItem:', selectedItem);

              if (!selectedItem) {
                console.log('selectedItem отсутствует');
                setError('Не выбран элемент для удаления');
                return;
              }

              switch (activeTab) {
                case 'users':
                  console.log('Удаление пользователя с ID:', selectedItem.id);
                  await handleDelete(
                    `http://localhost:5000/api/admin/users/${selectedItem.id}`,
                    loadUsers
                  );
                  break;
                case 'volunteers':
                  console.log('Удаление волонтера с ID:', selectedItem.id);
                  await handleDelete(
                    `http://localhost:5000/api/admin/volunteers/${selectedItem.id}`,
                    () => {
                      loadVolunteers();
                      loadVolunteerStats();
                    }
                  );
                  break;
                case 'advertisements':
                  console.log('Удаление объявления с ID:', selectedItem.id);
                  await handleDelete(
                    `http://localhost:5000/api/admin/advertisements/${selectedItem.id}`,
                    loadAdvertisements
                  );
                  break;
                case 'tasks':
                  console.log('Удаление задачи с ID:', selectedItem.id);
                  await handleDeleteTask(selectedItem.id);
                  break;
                default:
                  console.error('Неизвестный тип для удаления:', activeTab);
                  setError('Неизвестный тип элемента');
              }
            }}
          >
            Удалить
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminPanel;