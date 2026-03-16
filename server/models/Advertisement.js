import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Advertisement = sequelize.define('Advertisement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  animalType: {
    type: DataTypes.ENUM('cat', 'dog', 'other'),
    allowNull: false,
    field: 'animal_type'
  },
  status: {
    type: DataTypes.ENUM('lost', 'found'),
    allowNull: false
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'contact_name'
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'contact_phone'
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'contact_email'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'user_id'
  }
}, {
  tableName: 'advertisements',
  timestamps: true,
  underscored: true
});

Advertisement.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Advertisement, { foreignKey: 'user_id' });

export default Advertisement;