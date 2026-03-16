import User from '../models/User.js';
import { comparePassword } from '../utils/hashUtils.js';
import { Op } from 'sequelize';

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;


    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Пароли не совпадают' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const user = await User.create({
      name,
      email,
      password
    });

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    await user.update({ lastLogin: new Date() });

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при уничтожении сессии:', err);
      return res.status(500).json({ error: 'Ошибка при выходе из системы' });
    }
    
    res.clearCookie('sessionId', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ 
      message: 'Выход из системы выполнен успешно',
      success: true 
    });
  });
};

export const checkAuth = async (req, res) => {
  if (req.session.userId) {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json({ authenticated: true, user });
  } else {
    res.json({ authenticated: false });
  }
};