import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

export const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected (Render DB) ✅");
  } catch (err) {
    console.error("DB connection failed ❌", err);
    throw err;
  }
};

export default sequelize;
