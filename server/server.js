import dotenv from 'dotenv';
import express from 'express';
// Bypass for self-signed certificates removed as per best practices
import cors from 'cors';
import sequelize, { connectWithRetry } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import homeRoutes from './routes/home.routes.js';
import branchRoutes from './routes/branch.routes.js';
import posRoutes from './routes/pos.routes.js';
import sessionRoutes from './routes/session.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';

import User from './models/User.js';
import Branch from './models/Branch.js';

dotenv.config();

const app = express();

app.use(express.json());
// Explicit CORS to allow Vercel frontend
app.use(cors({
    origin: '*', // For debugging, allow all. In production, use specific domain.
    credentials: true
}));
app.use('/public', express.static('public'));

// ✅ Health Check with Versioning
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.5' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.5', proxied: true });
});

app.get('/health/db', async (req, res) => {
    console.log('Health check: Pinging Database...');
    try {
        await sequelize.authenticate();
        console.log('Health check: Database reachable');
        res.status(200).json({
            status: 'Database connected',
            version: '1.0.5',
            dialect: sequelize.getDialect()
        });
    } catch (error) {
        console.error('Health check: Database connection failed:', error.message);
        res.status(500).json({
            status: 'Database disconnected',
            version: '1.0.5',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({ status: 'API is running 🚀' });
});

// API routes
console.log('Mounting API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
console.log('All API routes integrated ✅');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Start Server IMMEDIATELY so Render detects the port
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });

    try {
        console.log('Attempting to connect to Database...');
        await sequelize.authenticate();
        console.log('PostgreSQL database connected via Sequelize');

        console.log(`Attempting DB Sync (alter: true)...`);
        await sequelize.sync({ alter: true });
        console.log(`Database synced successfully.`);

        // Auto-seed if no users exist
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('No users found. Seeding default admin...');
            const branch = await Branch.create({
                name: 'Main Branch',
                address: 'Default City',
                phone: '0000000000'
            });

            await User.create({
                username: 'admin',
                email: 'admin1@gmail.com',
                password: '123',
                role: 'admin',
                branchId: branch.id
            });
            console.log('Default admin created: admin1@gmail.com / 123');
        }

    } catch (err) {
        console.error('DB Connection/Sync Error:', err.message);
        // Do NOT exit process, keep server running so logs are visible and health check can reflect DB status
    }
};

startServer();
