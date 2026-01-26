import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const customerLogin = async (req, res) => {
    const { name, phone } = req.body;
    // OTP logic skipped for now as per "otp login no other credentials needed" - implying simple entry or mock OTP
    try {
        let customer = await Customer.findOne({ where: { phone } });
        if (!customer) {
            customer = await Customer.create({ name, phone });
        }

        // Return token
        res.json({
            _id: customer.id,
            name: customer.name,
            phone: customer.phone,
            token: generateToken(customer.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCustomerHistory = async (req, res) => {
    try {
        const customerId = req.user.id; // From middleware
        const orders = await Order.findAll({
            where: { customerId },
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
