import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Table from '../models/Table.js';
import sequelize from '../config/db.js';

export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { tableId, sessionId, items, subtotal, tax, total } = req.body;

        const order = await Order.create({
            tableId,
            sessionId,
            subtotal,
            tax,
            total,
            status: 'running'
        }, { transaction });

        const orderItems = items.map(item => ({
            orderId: order.id,
            productId: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        await OrderItem.bulkCreate(orderItems, { transaction });
        await Table.update({ status: 'occupied' }, {
            where: { id: tableId },
            transaction
        });

        await transaction.commit();
        res.status(201).json(order);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status === 'active') {
            whereClause.status = ['running', 'in-kitchen', 'ready', 'served'];
        } else if (status) {
            whereClause.status = status;
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'items' },
                { model: Table, attributes: ['number'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const formattedOrders = orders.map(order => {
            const plainOrder = order.get({ plain: true });
            return {
                ...plainOrder,
                tableNumber: plainOrder.Table ? plainOrder.Table.number : '?'
            };
        });

        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        await Order.update(req.body, { where: { id: orderId } });
        const order = await Order.findByPk(orderId);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderByTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const order = await Order.findOne({
            where: { tableId, status: 'running' },
            include: [{ model: OrderItem, as: 'items' }]
        });
        if (!order) {
            return res.status(404).json({ message: 'No running order for this table' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const processPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderId } = req.params;
        const { paymentMethod } = req.body;

        const order = await Order.findByPk(orderId, { transaction });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'paid';
        order.paymentMethod = paymentMethod;
        order.paidAt = new Date();
        await order.save({ transaction });

        await Table.update({ status: 'free' }, {
            where: { id: order.tableId },
            transaction
        });

        await transaction.commit();
        res.status(200).json(order);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};
