import express from 'express';
import {
    getFloors, createFloor, deleteFloor,
    getTablesByFloor, createTable, updateTableStatus,
    getProducts, createProduct, updateProduct, deleteProduct
} from '../controllers/pos.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Floor routes
router.get('/floors', protect, getFloors);
router.post('/floors', protect, admin, createFloor);
router.delete('/floors/:id', protect, admin, deleteFloor);

// Table routes
router.get('/floors/:floorId/tables', protect, getTablesByFloor);
router.post('/tables', protect, admin, createTable);
router.patch('/tables/:tableId', protect, updateTableStatus);

// Product routes
router.get('/products', protect, getProducts);
router.post('/products', protect, admin, createProduct);
router.put('/products/:id', protect, admin, updateProduct);
router.delete('/products/:id', protect, admin, deleteProduct);

export default router;
