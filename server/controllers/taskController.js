import Task from '../models/Task.js';
import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';
import Advertisement from '../models/Advertisement.js';
import { Op } from 'sequelize';

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const volunteer = await Volunteer.findOne({ where: { userId } });
    
    if (!volunteer) {
      return res.status(404).json({ error: 'Вы не зарегистрированы как волонтер' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { volunteerId: volunteer.id };
    if (status && status !== '') where.status = status;

    const tasks = await Task.findAndCountAll({
      where,
      include: [
        {
          model: Advertisement,
          attributes: ['id', 'animalType', 'status', 'city', 'description', 'photo']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const stats = {
      pending: await Task.count({ where: { volunteerId: volunteer.id, status: 'pending' } }),
      in_progress: await Task.count({ where: { volunteerId: volunteer.id, status: 'in_progress' } }),
      completed: await Task.count({ where: { volunteerId: volunteer.id, status: 'completed' } }),
      total: tasks.count
    };

    res.json({
      tasks: tasks.rows,
      stats,
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(tasks.count / limit),
        total: tasks.count
      }
    });
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({ error: 'Ошибка при получении задач' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const userId = req.session.userId;

    const task = await Task.findByPk(id, {
      include: [{
        model: Volunteer,
        attributes: ['userId']
      }]
    });

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    if (task.Volunteer.userId !== userId) {
      return res.status(403).json({ error: 'Это не ваша задача' });
    }

    const updates = { status };
    
    if (status === 'completed') {
      updates.completedAt = new Date();
      updates.completedComment = comment || null;
      
      await Volunteer.increment('completedMissions', { 
        where: { id: task.volunteerId } 
      });
    }

    await task.update(updates);

    res.json({
      message: 'Статус задачи обновлен',
      task
    });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: Volunteer,
          include: [{
            model: User,
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Advertisement,
          include: [{
            model: User,
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    if (task.Volunteer.userId !== userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа к этой задаче' });
    }

    res.json(task);
  } catch (error) {
    console.error('Ошибка получения задачи:', error);
    res.status(500).json({ error: 'Ошибка при получении задачи' });
  }
};