import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if present to ensure options are applied correctly
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // This fixes SELF_SIGNED_CERT_IN_CHAIN
      }
    },
    // Explicitly retry connection logic if internal driver fails
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 5
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  })
  : new Sequelize(
    process.env.DB_NAME || 'odoo_cafe_pos',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

// Test the connection with retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('PostgreSQL database connected via Sequelize...');
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('Max retries reached. Exiting.');
        throw err;
      }
    }
  }
};

// Export both sequelize and the connect function
export { connectWithRetry };
export default sequelize;
