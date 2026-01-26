import pkg from 'sequelize';
const { Sequelize, DataTypes } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

const ProductModel = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    branchId: { type: DataTypes.INTEGER, allowNull: true }
}, {
    timestamps: true,
    tableName: 'products'
});

const BranchModel = sequelize.define('Branch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'branches' });

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const branch = await BranchModel.findOne();
        if (!branch) {
            console.error('No branch found! Register a restaurant first.');
            process.exit(1);
        }
        const branchId = branch.id;
        console.log(`Seeding products for branch: ${branch.name} (ID: ${branchId})`);
        const products = [
            { name: 'Espresso', price: 120, category: 'Beverage', description: 'Strong black coffee', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80', branchId },
            { name: 'Cappuccino', price: 180, category: 'Beverage', description: 'Rich and creamy', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&q=80', branchId },
            { name: 'Cheese Burger', price: 250, category: 'Food', description: 'Gourmet burger with cheddar', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', branchId },
            { name: 'Veggie Pizza', price: 350, category: 'Food', description: 'Fresh veggies and mozzarella', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', branchId },
            { name: 'Chocolate Lava Cake', price: 200, category: 'Dessert', description: 'Warm cake with melting core', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80', branchId },
            { name: 'Iced Americano', price: 150, category: 'Beverage', description: 'Chilled espresso with water', image: 'https://images.unsplash.com/photo-1517701604599-bb28b3650422?w=500&q=80', branchId },
            { name: 'Chicken Wings', price: 280, category: 'Food', description: 'Spicy buffalo wings', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=500&q=80', branchId },
            { name: 'Caesar Salad', price: 220, category: 'Food', description: 'Crispy lettuce with parmesan', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80', branchId },
            { name: 'Blueberry Cheesecake', price: 240, category: 'Dessert', description: 'Creamy cake with berry topping', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80', branchId },
            { name: 'Matcha Latte', price: 220, category: 'Beverage', description: 'Pure Japanese matcha with milk', image: 'https://images.unsplash.com/photo-1552345097-69f9e38f9027?w=500&q=80', branchId }
        ];

        // Clear existing products first to avoid duplicates
        await ProductModel.destroy({ where: { branchId } });
        console.log('Cleared existing products');

        for (const p of products) {
            await ProductModel.create(p);
            console.log(`Added: ${p.name}`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
