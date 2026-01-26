import Floor from '../models/Floor.js';
import Table from '../models/Table.js';
import Product from '../models/Product.js';

export const getFloors = async (req, res) => {
    try {
        const branchId = req.user.branchId;
        const floors = await Floor.findAll({
            where: branchId ? { branchId } : {},
            include: [{
                model: Table,
                as: 'tables',
                attributes: ['id', 'number', 'seats', 'status']
            }]
        });
        res.status(200).json(floors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createFloor = async (req, res) => {
    try {
        const { name } = req.body;
        const branchId = req.user.branchId;
        const floor = await Floor.create({ name, branchId });
        res.status(201).json(floor);
    } catch (error) {
        console.error("Create Floor Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteFloor = async (req, res) => {
    try {
        const { id } = req.params;
        const branchId = req.user.branchId;
        const floor = await Floor.findOne({ where: { id, branchId } });
        if (!floor) return res.status(404).json({ message: 'Floor not found' });
        await floor.destroy();
        res.status(200).json({ message: 'Floor deleted' });
    } catch (error) {
        console.error("Delete Floor Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTableStatus = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { status } = req.body;

        const table = await Table.findByPk(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        table.status = status;
        await table.save();

        res.status(200).json(table);
    } catch (error) {
        console.error("Update Table Status Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const createTable = async (req, res) => {
    try {
        const { floorId, number, seats } = req.body;
        const branchId = req.user.branchId;
        console.log("Creating table for floor:", floorId, "branch:", branchId);
        const table = await Table.create({ floorId, number, seats, branchId });
        res.status(201).json(table);
    } catch (error) {
        console.error("Create Table Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const branchId = req.user.branchId;
        const products = await Product.findAll({
            where: { isAvailable: true, ...(branchId ? { branchId } : {}) }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, price, category, description, image } = req.body;
        const branchId = req.user.branchId;
        const product = await Product.create({ name, price, category, description, image, branchId });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const branchId = req.user.branchId;
        const product = await Product.findOne({ where: { id, branchId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.update(req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const branchId = req.user.branchId;
        const product = await Product.findOne({ where: { id, branchId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Placeholder for missing function in routes
export const getTablesByFloor = async (req, res) => {
    try {
        const { floorId } = req.params;
        const tables = await Table.findAll({ where: { floorId } });
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
