import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  helpTypes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hasTransport: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_transport'
  },
  canFoster: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_foster'
  },
  fosterConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'foster_conditions'
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
  },
  completedMissions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'completed_missions'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  reviews: {
    type: DataTypes.JSON,
    defaultValue: []
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
  tableName: 'volunteers',
  timestamps: true,
  underscored: true
});

// Связи
Volunteer.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Volunteer, { foreignKey: 'user_id' });

export default Volunteer;