import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Advertisement from '../models/Advertisement.js';
import Volunteer from '../models/Volunteer.js';
import Task from '../models/Task.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role && role !== '') where.role = role;
    if (status && status !== '') {
      where.isActive = status === 'active';
    }

    const users = await User.findAndCountAll({
      where,
      include: [{
        model: Profile,
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] }
    });

    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [{
        model: Profile,
        required: false
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, profile } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    if (profile) {
      let userProfile = await Profile.findOne({ where: { userId: id } });
      if (userProfile) {
        await userProfile.update(profile);
      } else {
        await Profile.create({ userId: id, ...profile });
      }
    }

    const updatedUser = await User.findByPk(id, {
      include: [Profile],
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Пользователь обновлен',
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Попытка удаления пользователя:', { id, adminId: req.session.userId });


    if (parseInt(id) === req.session.userId) {
      console.log('Попытка самоудаления');
      return res.status(400).json({ error: 'Нельзя удалить свой собственный аккаунт' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      console.log('Пользователь не найден:', id);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('Найден пользователь:', user.email);

    await Advertisement.update(
      { is_active: false },
      { where: { user_id: id } }
    );
    console.log('Объявления деактивированы');

    await Profile.destroy({ where: { userId: id } });
    console.log('Профиль удален');

    await Volunteer.destroy({ where: { userId: id } });
    console.log('Волонтерские записи удалены');

    await user.destroy();
    console.log('Пользователь удален');

    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя: ' + error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    console.log('Сброс пароля для пользователя:', { id, adminId: req.session.userId });

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user.password = newPassword; 
    await user.save();
    
    console.log('Пароль успешно сброшен для пользователя:', user.email);

    res.json({ message: 'Пароль пользователя сброшен' });
  } catch (error) {
    console.error(' Ошибка сброса пароля:', error);
    res.status(500).json({ error: 'Ошибка при сбросе пароля: ' + error.message });
  }
};

export const getAllAdvertisements = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, animalType, city, userId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { breed: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status && status !== '') where.status = status;
    if (animalType && animalType !== '') where.animal_type = animalType;
    if (city && city !== '') where.city = { [Op.like]: `%${city}%` };
    if (userId && userId !== '') where.user_id = userId;

    const advertisements = await Advertisement.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      advertisements: advertisements.rows,
      total: advertisements.count,
      page: parseInt(page),
      totalPages: Math.ceil(advertisements.count / limit)
    });
  } catch (error) {
    console.error('Ошибка получения объявлений:', error);
    res.status(500).json({ error: 'Ошибка при получении объявлений' });
  }
};

export const adminUpdateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }

    const dbUpdates = {};
    if (updates.animalType) dbUpdates.animal_type = updates.animalType;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.breed !== undefined) dbUpdates.breed = updates.breed;
    if (updates.city) dbUpdates.city = updates.city;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.contactName) dbUpdates.contact_name = updates.contactName;
    if (updates.contactPhone) dbUpdates.contact_phone = updates.contactPhone;
    if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    await advertisement.update(dbUpdates);

    const updatedAd = await Advertisement.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      message: 'Объявление обновлено',
      advertisement: updatedAd
    });
  } catch (error) {
    console.error('Ошибка обновления объявления:', error);
    res.status(500).json({ error: 'Ошибка при обновлении объявления' });
  }
};


export const adminDeleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Попытка удаления объявления:', { id, adminId: req.session.userId });

    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      console.log(' Объявление не найдено:', id);
      return res.status(404).json({ error: 'Объявление не найдено' });
    }

    console.log('Найдено объявление:', advertisement.id);

    await advertisement.destroy();
    console.log('Объявление удалено');

    res.json({ message: 'Объявление удалено' });
  } catch (error) {
    console.error('Ошибка удаления объявления:', error);
    res.status(500).json({ error: 'Ошибка при удалении объявления: ' + error.message });
  }
};

export const getAllVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status && status !== '') where.status = status;

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    console.log('Поиск волонтеров с параметрами:', { where, userWhere, offset, limit });

    const volunteers = await Volunteer.findAndCountAll({
      where,
      include: [{
        model: User,
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        attributes: ['id', 'name', 'email'],
        include: [{
          model: Profile,
          attributes: ['phone', 'city', 'avatar']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`Найдено волонтеров: ${volunteers.count}`);

    res.json({
      volunteers: volunteers.rows,
      total: volunteers.count,
      page: parseInt(page),
      totalPages: Math.ceil(volunteers.count / limit)
    });
  } catch (error) {
    console.error('Ошибка получения волонтеров:', error);
    res.status(500).json({ error: 'Ошибка при получении списка волонтеров: ' + error.message });
  }
};

export const getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
        include: [{
          model: Profile,
          attributes: ['phone', 'city', 'avatar', 'bio']
        }]
      }]
    });

    if (!volunteer) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    res.json(volunteer);
  } catch (error) {
    console.error('Ошибка получения заявки:', error);
    res.status(500).json({ error: 'Ошибка при получении заявки' });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Некорректный статус' });
    }

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    const updates = {
      status,
      ...(status === 'approved' && { approvedAt: new Date() })
    };

    await volunteer.update(updates);


    const updatedVolunteer = await Volunteer.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      message: `Статус заявки изменен на ${status}`,
      volunteer: updatedVolunteer
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
};

export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Попытка удаления заявки волонтера:', { id, adminId: req.session.userId });

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      console.log('Заявка не найдена:', id);
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    console.log('Найдена заявка для userId:', volunteer.userId);

    await Task.destroy({ where: { volunteerId: id } });
    console.log('Задачи удалены');

    await volunteer.destroy();
    console.log('Заявка удалена');

    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    console.error('Ошибка удаления заявки:', error);
    res.status(500).json({ error: 'Ошибка при удалении заявки: ' + error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Попытка удаления задачи:', { id, adminId: req.session.userId });

    const task = await Task.findByPk(id);
    if (!task) {
      console.log('Задача не найдена:', id);
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    console.log('Найдена задача:', task.title);
    await task.destroy();
    console.log('Задача удалена');

    res.json({ message: 'Задача удалена' });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({ error: 'Ошибка при удалении задачи: ' + error.message });
  }
};

export const getVolunteerStats = async (req, res) => {
  try {
    const total = await Volunteer.count();
    const pending = await Volunteer.count({ where: { status: 'pending' } });
    const approved = await Volunteer.count({ where: { status: 'approved' } });
    const rejected = await Volunteer.count({ where: { status: 'rejected' } });
    
    const helpTypesStats = await Volunteer.findAll({
      where: { status: 'approved' },
      attributes: []
    });

    const allVolunteers = await Volunteer.findAll({
      where: { status: 'approved' },
      attributes: ['helpTypes']
    });

    const helpTypesCount = {
      transport: 0,
      foster: 0,
      search: 0,
      info: 0,
      money: 0
    };

    allVolunteers.forEach(v => {
      v.helpTypes.forEach(type => {
        if (helpTypesCount[type] !== undefined) {
          helpTypesCount[type]++;
        }
      });
    });

    res.json({
      total,
      pending,
      approved,
      rejected,
      helpTypes: helpTypesCount
    });
  } catch (error) {
    console.error('Ошибка получения статистики волонтеров:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
};