import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Table from './Table.js';
import Session from './Session.js';
import Customer from './Customer.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Table,
            key: 'id'
        }
    },
    sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Session,
            key: 'id'
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.ENUM('draft', 'running', 'paid', 'cancelled'),
        defaultValue: 'draft'
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'upi', 'other')
    },
    paidAt: {
        type: DataTypes.DATE
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id'
        }
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Customer,
            key: 'id'
        }
    },
    kitchenStatus: {
        type: DataTypes.ENUM('pending', 'cooking', 'ready', 'served'),
        defaultValue: 'pending'
    },
    lockedBy: { // Kitchen staff user ID who is cooking this
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'orders'
});

Table.hasMany(Order, { foreignKey: 'tableId' });
Order.belongsTo(Table, { foreignKey: 'tableId' });

Session.hasMany(Order, { foreignKey: 'sessionId' });
Order.belongsTo(Session, { foreignKey: 'sessionId' });

Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

Session.hasMany(Order, { foreignKey: 'sessionId' });
Order.belongsTo(Session, { foreignKey: 'sessionId' });

export default Order;
