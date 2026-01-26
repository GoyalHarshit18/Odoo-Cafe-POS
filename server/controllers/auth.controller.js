import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, role, branchId, secret, expiresIn) => {
    return jwt.sign({ id, role, branchId }, secret, { expiresIn });
};

export const signupRequest = async (req, res) => {
    const { username, email, password, role, branchId } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'cashier',
            branchId: branchId || null,
            verified: true,
        });

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
            token: generateToken(user.id, user.role, user.branchId, process.env.JWT_SECRET, '30d'),
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginRequest = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
            token: generateToken(user.id, user.role, user.branchId, process.env.JWT_SECRET, '30d'),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Deprecated routes - returning success to maintain frontend stability if they are still called
export const verifySignup = async (req, res) => {
    res.status(200).json({ message: 'Success' });
};

export const verifyLogin = async (req, res) => {
    res.status(200).json({ message: 'Success' });
};
