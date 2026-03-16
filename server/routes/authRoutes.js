import express from 'express';
import { register, login, logout, checkAuth } from '../controllers/authController.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/check', checkAuth);

export default router;