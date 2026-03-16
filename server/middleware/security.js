import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import session from 'express-session';
import SequelizeStoreFactory from 'connect-session-sequelize';
import sequelize from '../config/database.js';
import crypto from 'crypto';

const SequelizeStore = SequelizeStoreFactory(session.Store);

// Создаем хранилище сессий
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
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Слишком много запросов с вашего IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: 'Слишком много попыток входа, попробуйте через час',
  skipSuccessfulRequests: true
});

// ✅ ЭКСПОРТИРУЕМ ВСЕ НУЖНЫЕ КОМПОНЕНТЫ
export { sessionStore };

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  },
  name: 'sessionId',
  proxy: true
};