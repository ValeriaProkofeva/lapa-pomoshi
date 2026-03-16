import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const dbPath = process.env.NODE_ENV === 'production'
  ? '/var/data/database.sqlite'  // Путь для Render (позже настроим диск)
  : path.join(__dirname, './database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage:  dbPath,
  logging: process.env.NODE_ENV !== 'production',
  define: {
    timestamps: true,
    underscored: true
  }
});

export default sequelize;