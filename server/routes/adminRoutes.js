import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllAdvertisements,
  adminUpdateAdvertisement,
  adminDeleteAdvertisement,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteerStatus,
  deleteVolunteer,
  getVolunteerStats
} from '../controllers/adminController.js';
import { authenticateUser, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(checkRole(['admin']));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', resetUserPassword);

router.get('/advertisements', getAllAdvertisements);
router.put('/advertisements/:id', adminUpdateAdvertisement);
router.delete('/advertisements/:id', adminDeleteAdvertisement);

router.get('/volunteers/stats', getVolunteerStats);
router.get('/volunteers', getAllVolunteers);
router.get('/volunteers/:id', getVolunteerById);
router.put('/volunteers/:id/status', updateVolunteerStatus);
router.delete('/volunteers/:id', deleteVolunteer);

export default router;