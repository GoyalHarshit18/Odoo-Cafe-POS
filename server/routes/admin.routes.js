import express from 'express';
import { registerRestaurant, getStaff, addStaff, removeStaff, getDashboardStats } from '../controllers/admin.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js'; // Assuming these exist, need to verify

const router = express.Router();

router.post('/signup', registerRestaurant);
router.get('/staff', protect, admin, getStaff);
router.post('/staff', protect, admin, addStaff);
router.delete('/staff/:id', protect, admin, removeStaff);
router.get('/stats', protect, admin, getDashboardStats);

export default router;
