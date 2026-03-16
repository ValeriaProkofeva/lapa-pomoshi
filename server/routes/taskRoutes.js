import express from 'express';
import {
  getMyTasks,
  updateTaskStatus,
  getTaskById
} from '../controllers/taskController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/my', getMyTasks);
router.get('/:id', getTaskById);
router.put('/:id/status', updateTaskStatus);

export default router;