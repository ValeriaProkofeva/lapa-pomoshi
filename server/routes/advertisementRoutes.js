import express from 'express';
import {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement
} from '../controllers/advertisementController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAdvertisements);
router.get('/:id', getAdvertisementById);
router.post('/', authenticateUser, createAdvertisement);
router.put('/:id', authenticateUser, updateAdvertisement);
router.delete('/:id', authenticateUser, deleteAdvertisement);

export default router;