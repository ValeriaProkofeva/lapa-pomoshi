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
app.set('trust proxy', true);
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 1. CORS (ОДИН РАЗ, ПЕРЕД ВСЕМ)
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

// ✅ 2. SECURITY HEADERS (helmet, CSP)
app.use(securityHeaders);



// ✅ 4. ПАРСИНГ ТЕЛА ЗАПРОСОВ
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 5. СЕССИИ (используем конфиг из security.js)
app.use(session(sessionConfig));

// ✅ 6. API МАРШРУТЫ
app.use('/api/auth', authRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);

// ✅ 7. РАЗДАЧА СТАТИКИ (ТОЛЬКО В PRODUCTION)
if (process.env.NODE_ENV === 'production') {
  console.log('📁 Продакшен режим: раздаем статику');
  
  const distPath = path.join(__dirname, '../dist');
  console.log('📂 Путь к статике:', distPath);
  
  // Раздаем статические файлы
  app.use(express.static(distPath));
  
  // Все не-API запросы отдаем index.html (для React Router)
  // ВАЖНО: используем именованный wildcard для новых версий Express
  app.get('/*splat', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// ✅ 8. СОЗДАНИЕ АДМИНА ПРИ ПЕРВОМ ЗАПУСКЕ
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
      
      await Profile.create({
        userId: admin.id,
        bio: 'Системный администратор',
        phone: '',
        city: '',
        avatar: '/default-avatar.png',
        telegram: '',
        vk: '',
        whatsapp: '',
        notificationsEnabled: true
      });
      
      console.log('✓ Администратор создан');
    } else {
      console.log('✓ Администратор уже существует');
    }
  } catch (error) {
    console.error('Ошибка при создании администратора:', error.message);
  }
}

// ✅ 9. ЗАПУСК СЕРВЕРА
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ Подключение к базе данных успешно');
    
    // Синхронизация моделей
    await User.sync({ force: false });
    console.log('✓ Таблица users синхронизирована');
    
    await Profile.sync({ force: false });
    console.log('✓ Таблица profiles синхронизирована');
    
    await Advertisement.sync({ force: false });
    console.log('✓ Таблица advertisements синхронизирована');
    
    await Volunteer.sync({ force: false });
    console.log('✓ Таблица volunteers синхронизирована');
    
    await Task.sync({ force: false });
    console.log('✓ Таблица tasks синхронизирована');
    try {
  await sessionStore.sync();
  console.log('✓ Таблица сессий создана');
} catch (error) {
  console.error('❌ Ошибка создания таблицы сессий:', error.message);
}

    // ✅ ВАЖНО: синхронизируем таблицу сессий
    if (sessionStore && typeof sessionStore.sync === 'function') {
      await sessionStore.sync();
      console.log('✓ Таблица сессий синхронизирована');
    } else {
      console.log('⚠️ sessionStore не имеет метода sync, пропускаем');
    }
    
    await createAdminUser();
    
    app.listen(PORT, () => {
      console.log(`✓ Сервер запущен на порту ${PORT}`);
      console.log(`✓ Режим: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Ошибка при запуске сервера:', error.message);
    console.error(error.stack); // Добавим полный стек ошибки
    process.exit(1);
  }
}

startServer();