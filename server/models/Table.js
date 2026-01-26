import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Floor from './Floor.js';

const Table = sequelize.define('Table', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seats: {
        type: DataTypes.INTEGER,
        defaultValue: 2
    },
    status: {
        type: DataTypes.ENUM('free', 'occupied'),
        defaultValue: 'free'
    },
    floorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Floor,
            key: 'id'
        }
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
    tableName: 'pos_tables'
});

Floor.hasMany(Table, { as: 'tables', foreignKey: 'floorId', onDelete: 'CASCADE' });
Table.belongsTo(Floor, { as: 'floor', foreignKey: 'floorId' });

export default Table;
