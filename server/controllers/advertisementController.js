import Advertisement from '../models/Advertisement.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

export const createAdvertisement = async (req, res) => {
  try {
    const {
      animalType,
      status,
      breed,
      city,
      description,
      photo,
      contactName,
      contactPhone,
      contactEmail
    } = req.body;

    if (!animalType || !status || !city || !description || !contactName || !contactPhone) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const advertisement = await Advertisement.create({
      animalType,
      status,
      breed: breed || null,
      city,
      description,
      photo: photo || null,
      contactName,
      contactPhone,
      contactEmail: contactEmail || null,
      userId: req.session.userId
    });

    res.status(201).json({
      message: 'Объявление создано',
      advertisement
    });
  } catch (error) {
    console.error('Ошибка создания объявления:', error);
    res.status(500).json({ error: 'Ошибка при создании объявления' });
  }
};

export const getAdvertisements = async (req, res) => {
  try {
    const {
      animalType,
      status,
      breed,
      city,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};
    
    if (animalType) where.animalType = animalType;
    if (status) where.status = status;
    if (breed) where.breed = { [Op.like]: `%${breed}%` };
    if (city) where.city = { [Op.like]: `%${city}%` };
    
    where.isActive = true;

    const offset = (page - 1) * limit;

    const advertisements = await Advertisement.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['name']
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

export const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const advertisement = await Advertisement.findByPk(id, {
      include: [{
        model: User,
        attributes: ['name', 'email']
      }]
    });

    if (!advertisement) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }

    res.json(advertisement);
  } catch (error) {
    console.error('Ошибка получения объявления:', error);
    res.status(500).json({ error: 'Ошибка при получении объявления' });
  }
};

export const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const advertisement = await Advertisement.findByPk(id);

    if (!advertisement) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }

    if (advertisement.userId !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав на редактирование' });
    }

    await advertisement.update(updates);

    res.json({
      message: 'Объявление обновлено',
      advertisement
    });
  } catch (error) {
    console.error('Ошибка обновления объявления:', error);
    res.status(500).json({ error: 'Ошибка при обновлении объявления' });
  }
};

export const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findByPk(id);

    if (!advertisement) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }

    if (advertisement.userId !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }

    await advertisement.update({ isActive: false });

    res.json({ message: 'Объявление удалено' });
  } catch (error) {
    console.error('Ошибка удаления объявления:', error);
    res.status(500).json({ error: 'Ошибка при удалении объявления' });
  }
};