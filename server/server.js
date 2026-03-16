import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { fileURLToPath } from 'url';
import path from 'path';
import helmet from 'helmet';
import sequelize from './config/database.js';
import { securityHeaders, limiter, sessionConfig } from './middleware/security.js';
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



app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  
    : 'http://localhost:5173',
  credentials: true
}));

app.use(securityHeaders);
app.use(limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://lapa-pomoshi.onrender.com'  
    : 'http://localhost:5173',
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session(sessionConfig));

app.use('/api/auth', authRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);

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

if (process.env.NODE_ENV === 'production') {
  console.log('📁 Продакшен режим: раздаем статику');
  
  const distPath = path.join(__dirname, '../dist');
  console.log('📂 Путь к статике:', distPath);
  

  app.use(express.static(distPath));
  
  app.get('/*splat', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ Подключение к базе данных успешно');
    
    await User.sync({ force: false });
    console.log('✓ Таблица users синхронизирована');
    
    await Profile.sync({ force: false });
    console.log('✓ Таблица profiles синхронизирована');
    
    await Advertisement.sync({ force: false });
    console.log('✓ Таблица advertisements синхронизирована');
     await Volunteer.sync();
     await Task.sync();
    
    await createAdminUser();
    
    app.listen(PORT, () => {
      console.log(`✓ Сервер запущен на порту ${PORT}`);
      console.log(`✓ Режим: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Ошибка при запуске сервера:', error.message);
    process.exit(1);
  }
}

startServer();