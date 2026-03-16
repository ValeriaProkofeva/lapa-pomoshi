import Profile from '../models/Profile.js';
import User from '../models/User.js';
import Volunteer from '../models/Volunteer.js';
import { hashPassword, comparePassword } from '../utils/hashUtils.js';


export const getProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      include: [
        {
          model: Profile,
          required: false
        },
        {
          model: Volunteer, 
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }


    if (!user.Profile) {
      const profile = await Profile.create({
        userId: user.id,
        bio: '',
        phone: '',
        city: '',
        avatar: '/default-avatar.png',
        telegram: '',
        vk: '',
        whatsapp: '',
        notificationsEnabled: true
      });
      user.Profile = profile;
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, bio, phone, city, avatar, telegram, vk, whatsapp, notificationsEnabled } = req.body;

    console.log('Обновление профиля для userId:', userId);
    console.log('Полученные данные:', { name, bio, phone, city, avatar, telegram, vk, whatsapp, notificationsEnabled });

    if (name) {
      await User.update({ name }, { where: { id: userId } });
    }

    let profile = await Profile.findOne({ where: { userId } });
    
    if (!profile) {
      profile = await Profile.create({
        userId,
        bio: bio || '',
        phone: phone || '',
        city: city || '',
        avatar: avatar || '/default-avatar.png',
        telegram: telegram || '',
        vk: vk || '',
        whatsapp: whatsapp || '',
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true
      });
      console.log('Создан новый профиль:', profile.toJSON());
    } else {
      await profile.update({
        bio: bio !== undefined ? bio : profile.bio,
        phone: phone !== undefined ? phone : profile.phone,
        city: city !== undefined ? city : profile.city,
        avatar: avatar !== undefined ? avatar : profile.avatar,
        telegram: telegram !== undefined ? telegram : profile.telegram,
        vk: vk !== undefined ? vk : profile.vk,
        whatsapp: whatsapp !== undefined ? whatsapp : profile.whatsapp,
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : profile.notificationsEnabled
      });
      console.log('Обновлен профиль:', profile.toJSON());
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      include: [{
        model: Profile,
        required: false
      }]
    });

    res.json({
      message: 'Профиль обновлен',
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля: ' + error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Новые пароли не совпадают' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({ error: 'Ошибка при изменении пароля' });
  }
};

export const getUserAdvertisements = async (req, res) => {
  try {
    const userId = req.session.userId;
    const Advertisement = (await import('../models/Advertisement.js')).default;

    const advertisements = await Advertisement.findAll({
      where: { userId, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json(advertisements);
  } catch (error) {
    console.error('Ошибка получения объявлений пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении объявлений' });
  }
};


export const deleteAccount = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Необходимо подтвердить пароль' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const Advertisement = (await import('../models/Advertisement.js')).default;
    await Advertisement.update(
      { isActive: false },
      { where: { userId } }
    );

    await Profile.destroy({ where: { userId } });
    await user.destroy();

    req.session.destroy();

    res.json({ message: 'Аккаунт успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления аккаунта:', error);
    res.status(500).json({ error: 'Ошибка при удалении аккаунта' });
  }
};