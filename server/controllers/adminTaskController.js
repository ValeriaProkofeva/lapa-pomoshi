import Task from '../models/Task.js';
import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Advertisement from '../models/Advertisement.js';
import { Op } from 'sequelize';

export const getAllTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      volunteerId,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    if (status && status !== '') where.status = status;
    if (priority && priority !== '') where.priority = priority;
    if (volunteerId && volunteerId !== '') where.volunteerId = volunteerId;

    const volunteerWhere = {};
    if (search) {
      volunteerWhere[Op.or] = [
        { '$Volunteer.User.name$': { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const tasks = await Task.findAndCountAll({
      where: { ...where, ...volunteerWhere },
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
          attributes: ['id', 'animalType', 'status', 'city']
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
      pending: await Task.count({ where: { status: 'pending' } }),
      in_progress: await Task.count({ where: { status: 'in_progress' } }),
      completed: await Task.count({ where: { status: 'completed' } }),
      cancelled: await Task.count({ where: { status: 'cancelled' } }),
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

export const createTask = async (req, res) => {
  try {
    const {
      volunteerId,
      title,
      description,
      taskType,
      priority,
      location,
      deadline,
      advertisementId,
      adminComment
    } = req.body;

    const adminId = req.session.userId;

    const volunteer = await Volunteer.findByPk(volunteerId, {
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Волонтер не найден' });
    }

    if (volunteer.status !== 'approved') {
      return res.status(400).json({ error: 'Задачи можно назначать только одобренным волонтерам' });
    }

    if (!volunteer.helpTypes.includes(taskType) && taskType !== 'other') {
      return res.status(400).json({ 
        error: 'Этот волонтер не указал данный вид помощи в своей заявке' 
      });
    }

    const task = await Task.create({
      volunteerId,
      title,
      description,
      taskType,
      priority: priority || 'medium',
      location,
      deadline,
      advertisementId: advertisementId || null,
      adminComment,
      createdBy: adminId,
      status: 'pending'
    });

    const createdTask = await Task.findByPk(task.id, {
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
          attributes: ['id', 'animalType', 'status', 'city']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ]
    });


    res.status(201).json({
      message: 'Задача успешно создана',
      task: createdTask
    });
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    res.status(500).json({ error: 'Ошибка при создании задачи' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    await task.update(updates);

    const updatedTask = await Task.findByPk(id, {
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
          attributes: ['id', 'animalType', 'status', 'city']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      message: 'Задача обновлена',
      task: updatedTask
    });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    await task.destroy();

    res.json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
  }
};

export const getAvailableVolunteers = async (req, res) => {
  try {
    const { taskType, region } = req.query;

    const where = { status: 'approved' };
    
    if (taskType && taskType !== 'other') {
      where.helpTypes = { [Op.contains]: [taskType] };
    }

    if (region) {
      where.region = { [Op.like]: `%${region}%` };
    }

    const volunteers = await Volunteer.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
        include: [{
          model: Profile,
          attributes: ['phone', 'city', 'avatar']
        }]
      }],
      order: [['completedMissions', 'DESC']]
    });

    const volunteersWithStats = await Promise.all(
      volunteers.map(async (vol) => {
        const pendingTasks = await Task.count({
          where: { volunteerId: vol.id, status: 'pending' }
        });
        const inProgressTasks = await Task.count({
          where: { volunteerId: vol.id, status: 'in_progress' }
        });

        return {
          ...vol.toJSON(),
          currentTasks: pendingTasks + inProgressTasks,
          pendingTasks,
          inProgressTasks
        };
      })
    );

    res.json(volunteersWithStats);
  } catch (error) {
    console.error('Ошибка получения волонтеров:', error);
    res.status(500).json({ error: 'Ошибка при получении списка волонтеров' });
  }
};