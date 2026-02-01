import dotenv from 'dotenv';
import express from 'express';
// Bypass for self-signed certificates in deployment
if (process.env.NODE_ENV === 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
import cors from 'cors';
import sequelize, { connectWithRetry } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import homeRoutes from './routes/home.routes.js';
import branchRoutes from './routes/branch.routes.js';
import posRoutes from './routes/pos.routes.js';
import sessionRoutes from './routes/session.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';

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
    res.status(200).json({ status: 'ok', version: '1.0.3' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.3', proxied: true });
});

app.get('/health/db', async (req, res) => {
    console.log('Health check: Pinging Database...');
    try {
        await sequelize.authenticate();
        console.log('Health check: Database reachable');
        res.status(200).json({
            status: 'Database connected',
            version: '1.0.3',
            dialect: sequelize.getDialect()
        });
    } catch (error) {
        console.error('Health check: Database connection failed:', error.message);
        res.status(500).json({
            status: 'Database disconnected',
            version: '1.0.2',
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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });

    try {
        await connectWithRetry();
        // Only alter table if in development. Production should use migrations or manual sync.
        const shouldAlter = process.env.NODE_ENV === 'development';
        await sequelize.sync({ alter: shouldAlter });
        console.log(`Database synced (alter: ${shouldAlter})`);
    } catch (err) {
        console.error('DB Sync Error:', err.message);
    }
};

startServer();
