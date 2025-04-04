import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    define: {
      timestamps: true,
      underscored: true,
    },
    logging: true,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connect DB Successfully!");
  } catch (error) {
    console.error("Error Connect DB", error);
    process.exit(1);
  }
}

async function syncDB() {
  await connectDB();

  await sequelize.sync({
    //  alter: true // for dev
    // force: false, // for prod
  });
  // console.log("Syn DB");
}
syncDB();

export { sequelize, connectDB };
