import Branch from '../models/Branch.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Floor from '../models/Floor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { Op } from 'sequelize';
// Helper to generate token (duplicate from auth controller, could refactor)
const generateToken = (id, role, branchId, secret, expiresIn) => {
    return jwt.sign({ id, role, branchId }, secret, { expiresIn });
};

export const registerRestaurant = async (req, res) => {
    const { restaurantName, restaurantPhone, restaurantEmail, restaurantAddress, adminName, adminEmail, adminPassword } = req.body;

    // Transaction would be better here, but keeping it simple for now
    try {
        // 1. Check if admin email already exists
        const userExists = await User.findOne({ where: { email: adminEmail } });
        if (userExists) {
            return res.status(400).json({ message: 'Admin email already registered' });
        }

        // 2. Create Branch
        const branch = await Branch.create({
            name: restaurantName,
            phone: restaurantPhone,
            email: restaurantEmail,
            address: restaurantAddress,
            adminName: adminName,
            isActive: true
        });

        // 3. Create Admin User linked to Branch
        const adminUser = await User.create({
            username: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            branchId: branch.id,
            verified: true
        });

        res.status(201).json({
            message: 'Restaurant and Admin registered successfully',
            branch: branch,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                role: adminUser.role,
                branchId: adminUser.branchId,
                token: generateToken(adminUser.id, adminUser.role, adminUser.branchId, process.env.JWT_SECRET, '30d')
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

export const getStaff = async (req, res) => {
    try {
        const branchId = req.user.branchId; // Assumes middleware sets req.user
        const staff = await User.findAll({
            where: { branchId: branchId },
            attributes: ['id', 'username', 'email', 'role', 'verified', 'createdAt']
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const addStaff = async (req, res) => {
    const { username, email, password, role } = req.body;
    const branchId = req.user.branchId;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({
                message: userExists.branchId === branchId
                    ? 'User already exists in your branch'
                    : 'User email already registered with another restaurant'
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'cashier',
            branchId,
            verified: true
        });

        res.status(201).json({ message: 'Staff created successfully', user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error("Add Staff Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { username, email, role, password } = req.body;
    const branchId = req.user.branchId;

    try {
        const user = await User.findOne({ where: { id, branchId } });
        if (!user) return res.status(404).json({ message: 'Staff not found' });

        user.username = username || user.username;
        user.email = email || user.email;
        user.role = role || user.role;
        if (password) user.password = password;

        await user.save();
        res.json({ message: 'Staff updated successfully', user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error("Update Staff Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const removeStaff = async (req, res) => {
    const { id } = req.params;
    const branchId = req.user.branchId;

    try {
        const user = await User.findOne({ where: { id, branchId } });
        if (!user) return res.status(404).json({ message: 'Staff not found' });

        if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });

        await user.destroy();
        res.json({ message: 'Staff removed' });
    } catch (error) {
        console.error("Remove Staff Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    const branchId = req.user.branchId;
    try {
        const [staffCount, productCount, floorCount, totalSales] = await Promise.all([
            User.count({ where: { branchId } }),
            Product.count({ where: { branchId } }),
            Floor.count({ where: { branchId } }),
            Order.sum('total', {
                where: {
                    branchId,
                    status: 'paid',
                    createdAt: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) // Today's sales
                    }
                }
            })
        ]);

        console.log(`[Stats] Branch: ${branchId} - Staff: ${staffCount}, Products: ${productCount}, Floors: ${floorCount}, Sales: ${totalSales}`);

        res.json({
            staff: staffCount,
            products: productCount,
            floors: floorCount,
            sales: totalSales || 0
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

