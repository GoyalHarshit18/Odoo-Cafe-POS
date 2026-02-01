import dotenv from 'dotenv';
import express from 'express';
// Bypass for self-signed certificates removed as per best practices
import cors from 'cors';
import sequelize, { connectWithRetry } from './config/db.js';
import { Op } from 'sequelize';

import authRoutes from './routes/auth.routes.js';
import homeRoutes from './routes/home.routes.js';
import branchRoutes from './routes/branch.routes.js';
import posRoutes from './routes/pos.routes.js';
import sessionRoutes from './routes/session.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';

import User from './models/User.js';
import Branch from './models/Branch.js';
import Floor from './models/Floor.js';
import Product from './models/Product.js';
import Table from './models/Table.js';
import Order from './models/Order.js';
import Session from './models/Session.js';

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
    res.status(200).json({ status: 'ok', version: '1.0.8-robust-cooking' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.8-robust-cooking', proxied: true });
});

app.get('/health/db', async (req, res) => {
    console.log('Health check: Pinging Database...');
    try {
        await sequelize.authenticate();
        console.log('Health check: Database reachable');
        res.status(200).json({
            status: 'Database connected',
            version: '1.0.8-robust-cooking',
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

        // --- UNIVERSAL SEEDING (FOR ALL BRANCHES) ---

        try {
            let branches = await Branch.findAll();
            if (branches.length === 0) {
                console.log('Seeding: No branches found. Creating "Main Branch"...');
                const mainBranch = await Branch.create({
                    name: 'Main Branch',
                    address: 'Default City',
                    phone: '0000000000'
                });
                branches = [mainBranch];
            }

            console.log(`Seeding: Found ${branches.length} branches. Ensuring data...`);

            for (const branch of branches) {
                try {
                    console.log(`--- Seeding Branch: ${branch.name} (ID: ${branch.id}) ---`);

                    // 2. Admin User
                    const adminUser = await User.findOne({ where: { role: 'admin', branchId: branch.id } });
                    if (!adminUser) {
                        await User.create({
                            username: `Admin ${branch.id}`,
                            email: branch.id === 1 ? 'admin1@gmail.com' : `admin${branch.id}@gmail.com`,
                            password: '123',
                            role: 'admin',
                            branchId: branch.id
                        });
                        console.log(`   Admin created ✅`);
                    }

                    // 3. Kitchen Staff
                    const kitchenUser = await User.findOne({ where: { role: 'kitchen', branchId: branch.id } });
                    if (!kitchenUser) {
                        await User.create({
                            username: `Kitchen ${branch.id}`,
                            email: branch.id === 1 ? 'kitchen1@gmail.com' : `kitchen${branch.id}@gmail.com`,
                            password: '1234',
                            role: 'kitchen',
                            branchId: branch.id
                        });
                        console.log(`   Kitchen staff created ✅`);
                    }

                    // 4. Floors
                    let groundFloor;
                    const floorCount = await Floor.count({ where: { branchId: branch.id } });
                    if (floorCount === 0) {
                        groundFloor = await Floor.create({ name: 'Ground Floor', branchId: branch.id });
                        await Floor.create({ name: 'First Floor', branchId: branch.id });
                        console.log('   Floors created ✅');
                    } else {
                        groundFloor = await Floor.findOne({ where: { name: 'Ground Floor', branchId: branch.id } });
                    }

                    // 5. Tables
                    let table;
                    const tableCount = await Table.count({ where: { branchId: branch.id } });
                    if (tableCount === 0 && groundFloor) {
                        const tables = await Table.bulkCreate([
                            { number: 1, seats: 2, floorId: groundFloor.id, branchId: branch.id },
                            { number: 2, seats: 4, floorId: groundFloor.id, branchId: branch.id },
                            { number: 3, seats: 6, floorId: groundFloor.id, branchId: branch.id }
                        ]);
                        table = tables[0];
                        console.log('   Tables created ✅');
                    } else {
                        table = await Table.findOne({ where: { branchId: branch.id } });
                    }

                    // 6. Products
                    const productCount = await Product.count({ where: { branchId: branch.id } });
                    if (productCount === 0) {
                        await Product.bulkCreate([
                            { name: 'Espresso', price: 120, category: 'Coffee', description: 'Strong black coffee', branchId: branch.id, image: 'https://images.unsplash.com/photo-1510707513152-52462e1a3597?q=80&w=800' },
                            { name: 'Cappuccino', price: 180, category: 'Coffee', description: 'Coffee with steamed milk foam', branchId: branch.id, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800' },
                            { name: 'Veg Burger', price: 250, category: 'Food', description: 'Crispy veg patty burger', branchId: branch.id, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800' }
                        ]);
                        console.log('   Products created ✅');
                    }

                    // 7. Session & Revenue
                    const todayOrdersCount = await Order.count({
                        where: {
                            branchId: branch.id,
                            createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
                        }
                    });

                    if (todayOrdersCount === 0 && table) {
                        console.log(`   Seeding: Adding revenue & test orders for branch ${branch.id}...`);
                        const activeAdmin = await User.findOne({ where: { role: 'admin', branchId: branch.id } });
                        if (activeAdmin) {
                            const session = await Session.create({
                                userId: activeAdmin.id,
                                branchId: branch.id,
                                openingBalance: 1000,
                                status: 'open'
                            });

                            // PAID Orders for Revenue
                            await Order.bulkCreate([
                                { branchId: branch.id, sessionId: session.id, tableId: table.id, total: 1500.00, status: 'paid', paymentMethod: 'cash', paidAt: new Date() },
                                { branchId: branch.id, sessionId: session.id, tableId: table.id, total: 1000.00, status: 'paid', paymentMethod: 'upi', paidAt: new Date() }
                            ]);

                            // RUNNING Order for Kitchen testing
                            await Order.create({
                                branchId: branch.id,
                                sessionId: session.id,
                                tableId: table.id,
                                total: 500.00,
                                status: 'running'
                            });

                            console.log(`   Revenue (₹2500) and Kitchen Test Order created ✅`);
                        }
                    }
                } catch (branchError) {
                    console.error(`Seeding Failure for branch ${branch.id}:`, branchError.message);
                }
            }
        } catch (e) {
            console.error('Core Seeding Error:', e.message);
        }

    } catch (err) {
        console.error('DB Connection/Sync Error:', err.message);
        // Do NOT exit process, keep server running so logs are visible and health check can reflect DB status
    }
};

startServer();
