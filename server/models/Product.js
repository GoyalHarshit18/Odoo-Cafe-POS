import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.TEXT
    },
    description: {
        type: DataTypes.TEXT
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'products'
});

export default Product;
