import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import advertisementRoutes from './routes/advertisementRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import adminTaskRoutes from './routes/adminTaskRoutes.js';
import User from './models/User.js';
import Advertisement from './models/Advertisement.js';
import Profile from './models/Profile.js';
import Volunteer from './models/Volunteer.js';
import Task from './models/Task.js';
import { securityHeaders, sessionConfig, sessionStore } from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ trust proxy для Render
app.set('trust proxy', 1);

// ✅ CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://lapa-pomoshi.onrender.com'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// ✅ Security headers
app.use(securityHeaders);

// ✅ Парсинг тела запросов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Сессии (теперь в БД!)
app.use(session(sessionConfig));

// ✅ API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);

// ✅ Статика в production
if (process.env.NODE_ENV === 'production') {
  console.log('📁 Продакшен режим: раздаем статику');
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('/*splat', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// ✅ Создание админа
async function createAdminUser() {
  try {
    const adminExists = await User.findOne({ where: { email: 'admin@lapapomoshi.ru' } });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Administrator',
        email: 'admin@lapapomoshi.ru',
        password: 'Admin123!@#',
        role: 'admin'
      });
      await Profile.create({ userId: admin.id });
      console.log('✓ Администратор создан');
    }
  } catch (error) {
    console.error('Ошибка создания админа:', error.message);
  }
}

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Запуск сервера
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ База данных подключена');

    // Синхронизация моделей
    await User.sync();
    await Profile.sync();
    await Advertisement.sync();
    await Volunteer.sync();
    await Task.sync();

    // ✅ Синхронизация таблицы сессий (ВАЖНО!)
    await sessionStore.sync();
    console.log('✓ Таблица сессий создана');

    await createAdminUser();

    app.listen(PORT, () => {
      console.log(`✓ Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Ошибка запуска:', error);
    process.exit(1);
  }
}

startServer();