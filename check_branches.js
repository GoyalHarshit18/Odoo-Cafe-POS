import Branch from './server/models/Branch.js';
import sequelize from './server/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkBranches() {
    try {
        await sequelize.authenticate();
        const branches = await Branch.findAll();
        console.log('Branches in DB:');
        branches.forEach(b => console.log(`${b.id}: ${b.name}`));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
checkBranches();
