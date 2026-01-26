import Session from '../models/Session.js';
import Order from '../models/Order.js';

export const openSession = async (req, res) => {
    try {
        const { openingBalance } = req.body;
        const userId = req.user.id;
        const branchId = req.user.branchId;

        // Check if there's already an active session
        const activeSession = await Session.findOne({
            where: { userId, status: 'open' }
        });

        if (activeSession) {
            return res.status(400).json({ message: 'You already have an active session' });
        }

        const session = await Session.create({
            userId,
            branchId,
            openingBalance,
            startTime: new Date(),
            status: 'open'
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const closeSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { closingBalance } = req.body;

        const session = await Session.findOne({
            where: { userId, status: 'open' }
        });

        if (!session) {
            return res.status(404).json({ message: 'Active session not found' });
        }

        session.closingBalance = closingBalance;
        session.endTime = new Date();
        session.status = 'closed';
        await session.save();

        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const session = await Session.findOne({
            where: { userId, status: 'open' }
        });

        if (!session) {
            return res.status(200).json(null);
        }

        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionSummary = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const orders = await Order.findAll({
            where: { sessionId, status: 'paid' }
        });

        const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        const ordersCount = orders.length;

        res.status(200).json({ totalSales, ordersCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
