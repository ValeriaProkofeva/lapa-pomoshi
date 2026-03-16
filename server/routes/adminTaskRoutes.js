import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getAvailableVolunteers
} from '../controllers/adminTaskController.js';
import { authenticateUser, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(checkRole(['admin']));

router.get('/', getAllTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/volunteers/available', getAvailableVolunteers);

export default router;