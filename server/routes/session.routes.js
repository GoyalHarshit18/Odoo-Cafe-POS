import express from 'express';
import { openSession, closeSession, getActiveSession } from '../controllers/session.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Match frontend calls
router.post('/open', protect, openSession);
router.post('/close', protect, closeSession);

router.route('/')
    .get(protect, getActiveSession)
    .post(protect, openSession);

router.post('/:sessionId/close', protect, closeSession);

export default router;
