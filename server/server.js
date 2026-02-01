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

        // --- GRANULAR SEEDING WITH LOGGING ---

        // 1. Ensure a Branch exists
        let branch;
        try {
            branch = await Branch.findOne();
            if (!branch) {
                console.log('Seeding: No branch found. Creating "Main Branch"...');
                branch = await Branch.create({
                    name: 'Main Branch',
                    address: 'Default City',
                    phone: '0000000000'
                });
                console.log('Seeding: Branch created ✅');
            } else {
                console.log(`Seeding: Using existing branch: ${branch.name}`);
            }
        } catch (e) {
            console.error('Seeding Error (Branch):', e.message);
        }

        if (branch) {
            // 2. Ensure Admin User exists
            try {
                const adminExists = await User.findOne({ where: { role: 'admin' } });
                if (!adminExists) {
                    console.log('Seeding: Creating default admin (admin1@gmail.com)...');
                    await User.create({
                        username: 'admin',
                        email: 'admin1@gmail.com',
                        password: '123',
                        role: 'admin',
                        branchId: branch.id
                    });
                    console.log('Seeding: Admin created ✅');
                }
            } catch (e) { console.error('Seeding Error (Admin):', e.message); }

            // 3. Ensure Kitchen Staff exists
            try {
                const kitchenExists = await User.findOne({ where: { role: 'kitchen' } });
                if (!kitchenExists) {
                    console.log('Seeding: Creating kitchen staff (kitchen1@gmail.com)...');
                    await User.create({
                        username: 'Kitchen Staff',
                        email: 'kitchen1@gmail.com',
                        password: '1234',
                        role: 'kitchen',
                        branchId: branch.id
                    });
                    console.log('Seeding: Kitchen staff created ✅');
                }
            } catch (e) { console.error('Seeding Error (Kitchen):', e.message); }

            // 4. Ensure Floors exist
            try {
                const floorCount = await Floor.count();
                if (floorCount === 0) {
                    console.log('Seeding: Creating floors...');
                    await Floor.create({ name: 'Ground Floor', branchId: branch.id });
                    await Floor.create({ name: 'First Floor', branchId: branch.id });
                    console.log('Seeding: Floors created ✅');
                }
            } catch (e) { console.error('Seeding Error (Floors):', e.message); }

            // 5. Ensure Tables exist (User's request)
            try {
                const tableCount = await Table.count();
                if (tableCount === 0) {
                    console.log('Seeding: Creating tables for Ground Floor...');
                    const groundFloor = await Floor.findOne({ where: { name: 'Ground Floor' } });
                    if (groundFloor) {
                        await Table.bulkCreate([
                            { number: 1, seats: 2, floorId: groundFloor.id, branchId: branch.id },
                            { number: 2, seats: 4, floorId: groundFloor.id, branchId: branch.id },
                            { number: 3, seats: 6, floorId: groundFloor.id, branchId: branch.id },
                            { number: 4, seats: 4, floorId: groundFloor.id, branchId: branch.id }
                        ]);
                        console.log('Seeding: Tables created ✅');
                    }
                }
            } catch (e) { console.error('Seeding Error (Tables):', e.message); }

            // 6. Ensure Products exist
            try {
                const productCount = await Product.count();
                if (productCount === 0) {
                    console.log('Seeding: Creating products with images...');
                    await Product.bulkCreate([
                        { name: 'Espresso', price: 120, category: 'Coffee', description: 'Strong black coffee', branchId: branch.id, image: 'https://images.unsplash.com/photo-1510707513152-52462e1a3597?q=80&w=800' },
                        { name: 'Cappuccino', price: 180, category: 'Coffee', description: 'Coffee with steamed milk foam', branchId: branch.id, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800' },
                        { name: 'Latte', price: 200, category: 'Coffee', description: 'Creamy milk coffee', branchId: branch.id, image: 'https://images.unsplash.com/photo-1536939459926-301728717817?q=80&w=800' },
                        { name: 'Green Tea', price: 100, category: 'Tea', description: 'Healthy green tea', branchId: branch.id, image: 'https://images.unsplash.com/photo-1523920290228-4f321a939b4c?q=80&w=800' },
                        { name: 'Veg Burger', price: 250, category: 'Food', description: 'Crispy veg patty burger', branchId: branch.id, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800' },
                        { name: 'Chicken Sandwich', price: 300, category: 'Food', description: 'Grilled chicken sandwich', branchId: branch.id, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800' }
                    ]);
                    console.log('Seeding: Products created ✅');
                } else {
                    // Update images if missing
                    const productsWithNoImage = await Product.findAll({ where: { image: null } });
                    if (productsWithNoImage.length > 0) {
                        console.log(`Seeding: Updating ${productsWithNoImage.length} products with missing images...`);
                        const imageMap = {
                            'Espresso': 'https://images.unsplash.com/photo-1510707513152-52462e1a3597?q=80&w=800',
                            'Cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800',
                            'Latte': 'https://images.unsplash.com/photo-1536939459926-301728717817?q=80&w=800',
                            'Green Tea': 'https://images.unsplash.com/photo-1523920290228-4f321a939b4c?q=80&w=800',
                            'Veg Burger': 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800',
                            'Chicken Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800'
                        };
                        for (const prod of productsWithNoImage) {
                            if (imageMap[prod.name]) await prod.update({ image: imageMap[prod.name] });
                        }
                        console.log('Seeding: Missing images updated ✅');
                    }
                }
            } catch (e) { console.error('Seeding Error (Products):', e.message); }
        }

    } catch (err) {
        console.error('DB Connection/Sync Error:', err.message);
        // Do NOT exit process, keep server running so logs are visible and health check can reflect DB status
    }
};

startServer();
