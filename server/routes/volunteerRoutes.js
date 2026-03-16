import express from 'express';
import {
  getVolunteerInfo,
  getVolunteerStatus,
  registerVolunteer,
  getAllVolunteers,
  updateVolunteerStatus,
  updateVolunteer
} from '../controllers/volunteerController.js';
import { authenticateUser, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/info', getVolunteerInfo);

router.get('/status', authenticateUser, getVolunteerStatus);
router.post('/register', authenticateUser, registerVolunteer);
router.put('/update', authenticateUser, updateVolunteer);

router.get('/all', authenticateUser, checkRole(['admin']), getAllVolunteers);
router.put('/:id/status', authenticateUser, checkRole(['admin']), updateVolunteerStatus);

export default router;