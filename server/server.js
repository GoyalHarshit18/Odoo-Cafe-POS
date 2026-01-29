import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sequelize, { connectWithRetry } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import homeRoutes from './routes/home.routes.js';
import branchRoutes from './routes/branch.routes.js';
import posRoutes from './routes/pos.routes.js';
import sessionRoutes from './routes/session.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import customerRoutes from './routes/customer.routes.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/public', express.static('public'));

// Health check (VERY IMPORTANT for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

const PORT = process.env.PORT || 5000;

// 🚀 Start server FIRST
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// 🔁 Connect DB AFTER server is live
(async () => {
    try {
        console.log('Attempting to connect to database...');
        await connectWithRetry();
        await sequelize.sync();
        console.log('Database synced successfully');
    } catch (error) {
        console.error(
            'Database connection failed. Server is running, retry on next request.',
            error.message
        );
    }
})();
