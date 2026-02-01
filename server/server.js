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
    res.status(200).json({ status: 'ok', version: '1.0.7-revenue-seed' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.7-revenue-seed', proxied: true });
});

app.get('/health/db', async (req, res) => {
    console.log('Health check: Pinging Database...');
    try {
        await sequelize.authenticate();
        console.log('Health check: Database reachable');
        res.status(200).json({
            status: 'Database connected',
            version: '1.0.7-revenue-seed',
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
            // 1. Ensure at least one branch exists
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

            console.log(`Seeding: Processing ${branches.length} branches...`);

            for (const branch of branches) {
                console.log(`--- Seeding Branch: ${branch.name} (ID: ${branch.id}) ---`);

                // 2. Admin User
                const adminExists = await User.findOne({ where: { role: 'admin', branchId: branch.id } });
                if (!adminExists) {
                    await User.create({
                        username: `Admin ${branch.id}`,
                        email: branch.id === 1 ? 'admin1@gmail.com' : `admin${branch.id}@gmail.com`,
                        password: '123',
                        role: 'admin',
                        branchId: branch.id
                    });
                    console.log(`   Admin created: admin${branch.id}@gmail.com ✅`);
                }

                // 3. Kitchen Staff
                const kitchenExists = await User.findOne({ where: { role: 'kitchen', branchId: branch.id } });
                if (!kitchenExists) {
                    await User.create({
                        username: `Kitchen ${branch.id}`,
                        email: branch.id === 1 ? 'kitchen1@gmail.com' : `kitchen${branch.id}@gmail.com`,
                        password: '1234',
                        role: 'kitchen',
                        branchId: branch.id
                    });
                    console.log(`   Kitchen staff created: kitchen${branch.id}@gmail.com ✅`);
                }

                // 4. Floors
                const floorCount = await Floor.count({ where: { branchId: branch.id } });
                if (floorCount === 0) {
                    const f1 = await Floor.create({ name: 'Ground Floor', branchId: branch.id });
                    await Floor.create({ name: 'First Floor', branchId: branch.id });
                    console.log('   Floors created ✅');

                    // 5. Tables (Only if floors were just created)
                    await Table.bulkCreate([
                        { number: 1, seats: 2, floorId: f1.id, branchId: branch.id },
                        { number: 2, seats: 4, floorId: f1.id, branchId: branch.id },
                        { number: 3, seats: 6, floorId: f1.id, branchId: branch.id }
                    ]);
                    console.log('   Tables created ✅');
                }

                // 6. Products
                const productCount = await Product.count({ where: { branchId: branch.id } });
                if (productCount === 0) {
                    await Product.bulkCreate([
                        { name: 'Espresso', price: 120, category: 'Coffee', description: 'Strong black coffee', branchId: branch.id, image: 'https://images.unsplash.com/photo-1510707513152-52462e1a3597?q=80&w=800' },
                        { name: 'Cappuccino', price: 180, category: 'Coffee', description: 'Coffee with steamed milk foam', branchId: branch.id, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800' },
                        { name: 'Veg Burger', price: 250, category: 'Food', description: 'Crispy veg patty burger', branchId: branch.id, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800' },
                        { name: 'Chicken Sandwich', price: 300, category: 'Food', description: 'Grilled chicken sandwich', branchId: branch.id, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800' }
                    ]);
                    console.log('   Products created ✅');
                } else {
                    // Update missing images
                    const productsWithNoImage = await Product.findAll({ where: { branchId: branch.id, image: null } });
                    if (productsWithNoImage.length > 0) {
                        const imageMap = {
                            'Espresso': 'https://images.unsplash.com/photo-1510707513152-52462e1a3597?q=80&w=800',
                            'Cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800',
                            'Veg Burger': 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800',
                            'Chicken Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800'
                        };
                        for (const prod of productsWithNoImage) {
                            if (imageMap[prod.name]) await prod.update({ image: imageMap[prod.name] });
                        }
                        console.log('   Missing images updated ✅');
                    }
                }

                // 7. NEW: Seed Revenue (Sessions and Orders)
                try {
                    const todayOrdersCount = await Order.count({
                        where: {
                            branchId: branch.id,
                            createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
                        }
                    });

                    if (todayOrdersCount === 0) {
                        console.log(`   Seeding: Adding sample revenue for branch ${branch.id}...`);

                        // Create an active session
                        const adminUser = await User.findOne({ where: { role: 'admin', branchId: branch.id } });
                        if (adminUser) {
                            const session = await Session.create({
                                userId: adminUser.id,
                                branchId: branch.id,
                                openingBalance: 1000,
                                status: 'open'
                            });

                            const floor = await Floor.findOne({ where: { branchId: branch.id } });
                            const table = await Table.findOne({ where: { branchId: branch.id } });

                            // Create 3 paid orders to generate revenue
                            await Order.bulkCreate([
                                {
                                    branchId: branch.id,
                                    sessionId: session.id,
                                    tableId: table ? table.id : 1,
                                    total: 450.00,
                                    status: 'paid',
                                    paymentMethod: 'cash',
                                    paidAt: new Date()
                                },
                                {
                                    branchId: branch.id,
                                    sessionId: session.id,
                                    tableId: table ? table.id : 1,
                                    total: 1250.00,
                                    status: 'paid',
                                    paymentMethod: 'upi',
                                    paidAt: new Date()
                                },
                                {
                                    branchId: branch.id,
                                    sessionId: session.id,
                                    tableId: table ? table.id : 1,
                                    total: 800.00,
                                    status: 'paid',
                                    paymentMethod: 'card',
                                    paidAt: new Date()
                                }
                            ]);
                            console.log(`   Revenue added for branch ${branch.id}: (₹2500 Today) ✅`);
                        }
                    } else {
                        console.log(`   Seeding: Branch ${branch.id} already has orders for today. Skipping revenue seed.`);
                    }
                } catch (e) {
                    console.error(`   Seeding Error (Revenue branch ${branch.id}):`, e.message);
                }
            }
        } catch (e) {
            console.error('Universal Seeding Error:', e.message);
        }

    } catch (err) {
        console.error('DB Connection/Sync Error:', err.message);
        // Do NOT exit process, keep server running so logs are visible and health check can reflect DB status
    }
};

startServer();
