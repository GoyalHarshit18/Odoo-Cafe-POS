import express from 'express';
import { customerLogin, getCustomerHistory } from '../controllers/customer.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // Ensure protect handles 'customer' role or create separate

const router = express.Router();

router.post('/login', customerLogin);
router.get('/history', protect, getCustomerHistory);

export default router;
