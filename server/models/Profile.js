import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/default-avatar.png'
  },
  telegram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vk: {
    type: DataTypes.STRING,
    allowNull: true
  },
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notifications_enabled'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    },
    field: 'user_id'
  }
}, {
  tableName: 'profiles',
  timestamps: true,
  underscored: true
});

// Связи
Profile.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Profile, { foreignKey: 'user_id' });

export default Profile;