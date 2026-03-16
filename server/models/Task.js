import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Volunteer from './Volunteer.js';
import Advertisement from './Advertisement.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  taskType: {
    type: DataTypes.ENUM('transport', 'foster', 'search', 'info', 'money', 'other'),
    allowNull: false,
    field: 'task_type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
    field: 'status'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  completedComment: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'completed_comment'
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_comment'
  },
  volunteerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Volunteer,
      key: 'id'
    },
    field: 'volunteer_id'
  },
  advertisementId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Advertisement,
      key: 'id'
    },
    field: 'advertisement_id'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'created_by'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

// Связи
Task.belongsTo(Volunteer, { foreignKey: 'volunteer_id' });
Volunteer.hasMany(Task, { foreignKey: 'volunteer_id' });

Task.belongsTo(Advertisement, { foreignKey: 'advertisement_id' });
Advertisement.hasMany(Task, { foreignKey: 'advertisement_id' });

Task.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

export default Task;