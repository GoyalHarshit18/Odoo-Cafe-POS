import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (process.env.DATABASE_URL) {
  // Cloud Deployment (Supabase/Render/Heroku)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for most cloud DBs
      }
    }
  });
} else {
  // Local Development
  sequelize = new Sequelize(
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
}

export default sequelize;
