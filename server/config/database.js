import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPath;

if (process.env.NODE_ENV === 'production') {
  const dataDir = path.join(__dirname, '../../data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  dbPath = path.join(dataDir, 'database.sqlite');
  console.log('📁 Продакшен БД путь:', dbPath);
} else {
  dbPath = path.join(__dirname, '../../database.sqlite');
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV !== 'production'
});

export default sequelize;