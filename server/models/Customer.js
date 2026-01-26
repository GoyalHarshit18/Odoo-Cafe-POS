import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true // Store hashed OTP temporarily or just usage logs
    },
    otpExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'customers'
});

export default Customer;
