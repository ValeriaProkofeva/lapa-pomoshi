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

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 1. CORS - максимально открыто для отладки
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://lapa-pomoshi.onrender.com'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// ✅ 2. Логирование ВСЕХ запросов
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  console.log('🍪 Cookies from client:', req.headers.cookie);
  console.log('🔑 Session ID:', req.sessionID);
  console.log('👤 User ID in session:', req.session?.userId);
  
  // Логируем ответ
  const oldSend = res.send;
  res.send = function(data) {
    console.log('📤 Response headers:', res.getHeaders());
    console.log('🍪 Set-Cookie:', res.getHeaders()['set-cookie']);
    oldSend.apply(res, arguments);
  };
  
  next();
});

// ✅ 3. Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 4. ПРОСТАЯ КОНФИГУРАЦИЯ СЕССИИ (без Sequelize store для начала)
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'debug-secret-key-12345',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // ВРЕМЕННО false для отладки
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax' // ВРЕМЕННО lax
  },
  name: 'sessionId',
  proxy: true
};

app.use(session(sessionConfig));

// ✅ 5. ТЕСТОВЫЙ ЭНДПОИНТ
app.get('/api/debug', (req, res) => {
  console.log('🔍 Debug endpoint called');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }
  
  res.json({
    message: 'Debug endpoint',
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    views: req.session.views
  });
});

// ✅ 6. API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);

// ✅ 7. Раздача статики (если есть)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('/*splat', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// ✅ 8. Запуск сервера
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ База данных подключена');
    
    await sequelize.sync({ force: false });
    console.log('✓ Модели синхронизированы');
    
    app.listen(PORT, () => {
      console.log(`✓ Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Ошибка:', error);
  }
}

startServer();