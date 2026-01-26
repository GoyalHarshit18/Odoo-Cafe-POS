import express from 'express';
import { createOrder, getOrders, updateOrder, getOrderByTable, processPayment } from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/table/:tableId', protect, getOrderByTable);
router.put('/:orderId', protect, updateOrder);
router.post('/:orderId/pay', protect, processPayment);

export default router;
