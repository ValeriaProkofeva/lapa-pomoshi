import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserAdvertisements,
  deleteAccount
} from '../controllers/profileController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser); 

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.get('/advertisements', getUserAdvertisements);
router.delete('/', deleteAccount);

export default router;