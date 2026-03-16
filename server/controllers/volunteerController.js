import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { Op } from 'sequelize';

export const getVolunteerInfo = async (req, res) => {
  try {
    const volunteers = await Volunteer.count({ where: { status: 'approved' } });
    const completedMissions = await Volunteer.sum('completedMissions');
    
    res.json({
      volunteersCount: volunteers,
      completedMissions: completedMissions || 0,
      helpTypes: [
        { id: 'transport', label: 'Транспортировка животных' },
        { id: 'foster', label: 'Передержка' },
        { id: 'search', label: 'Поиск пропавших' },
        { id: 'info', label: 'Распространение информации' },
        { id: 'money', label: 'Финансовая помощь' }
      ]
    });
  } catch (error) {
    console.error('Ошибка получения информации о волонтерах:', error);
    res.status(500).json({ error: 'Ошибка при получении информации' });
  }
};

export const getVolunteerStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const volunteer = await Volunteer.findOne({
      where: { userId },
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    res.json({
      isVolunteer: !!volunteer,
      status: volunteer?.status || null,
      data: volunteer || null
    });
  } catch (error) {
    console.error('Ошибка получения статуса волонтера:', error);
    res.status(500).json({ error: 'Ошибка при получении статуса' });
  }
};

export const registerVolunteer = async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      experience,
      helpTypes,
      availability,
      hasTransport,
      canFoster,
      fosterConditions,
      region
    } = req.body;

    if (!helpTypes || helpTypes.length === 0) {
      return res.status(400).json({ error: 'Выберите хотя бы один вид помощи' });
    }
    if (!availability) {
      return res.status(400).json({ error: 'Укажите вашу доступность' });
    }
    if (!region) {
      return res.status(400).json({ error: 'Укажите ваш регион' });
    }

    const existingVolunteer = await Volunteer.findOne({ where: { userId } });
    if (existingVolunteer) {
      return res.status(400).json({ error: 'Вы уже подали заявку на волонтерство' });
    }

    const volunteer = await Volunteer.create({
      userId,
      experience,
      helpTypes,
      availability,
      hasTransport: hasTransport || false,
      canFoster: canFoster || false,
      fosterConditions: fosterConditions || null,
      region,
      status: 'pending'
    });

    const user = await User.findByPk(userId, {
      attributes: ['name', 'email'],
      include: [Profile]
    });

    res.status(201).json({
      message: 'Заявка на волонтерство успешно отправлена',
      volunteer: {
        ...volunteer.toJSON(),
        user
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации волонтера:', error);
    res.status(500).json({ error: 'Ошибка при регистрации волонтера' });
  }
};

export const getAllVolunteers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const volunteers = await Volunteer.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
        include: [Profile]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      volunteers: volunteers.rows,
      total: volunteers.count,
      page: parseInt(page),
      totalPages: Math.ceil(volunteers.count / limit)
    });
  } catch (error) {
    console.error('Ошибка получения волонтеров:', error);
    res.status(500).json({ error: 'Ошибка при получении списка волонтеров' });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Некорректный статус' });
    }

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    await volunteer.update({
      status,
      approvedAt: status === 'approved' ? new Date() : null
    });

    res.json({
      message: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
      volunteer
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
};

export const updateVolunteer = async (req, res) => {
  try {
    const userId = req.session.userId;
    const updates = req.body;

    const volunteer = await Volunteer.findOne({ where: { userId } });
    if (!volunteer) {
      return res.status(404).json({ error: 'Волонтер не найден' });
    }

    delete updates.status;

    await volunteer.update(updates);

    res.json({
      message: 'Данные обновлены',
      volunteer
    });
  } catch (error) {
    console.error('Ошибка обновления данных:', error);
    res.status(500).json({ error: 'Ошибка при обновлении данных' });
  }
};