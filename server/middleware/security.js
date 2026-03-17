import helmet from 'helmet';
import session from 'express-session';
import SequelizeStoreFactory from 'connect-session-sequelize';
import sequelize from '../config/database.js';
import crypto from 'crypto';

const SequelizeStore = SequelizeStoreFactory(session.Store);

// Создаем хранилище сессий в БД
const sessionStore = new SequelizeStore({
  db: sequelize
});

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://lapa-pomoshi.onrender.com", "ws:", "wss:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      scriptSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// ✅ Rate-limit ПОЛНОСТЬЮ УБРАН

// Экспортируем store для синхронизации
export { sessionStore };

// Настройки сессии (упрощенные для надежности)
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  store: sessionStore,
  resave: true, // Важно для SequelizeStore
  saveUninitialized: true, // Важно для создания сессий
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  name: 'sessionId',
  proxy: true
};