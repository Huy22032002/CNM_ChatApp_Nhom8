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
    logging: console.log,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connect DB Successfully!");
  } catch (error) {
    console.error("Error Connect DB", error.message);
    console.error("Stack Trace:", error.stack);
    process.exit(1);
  }
}

async function syncDB() {
<<<<<<< HEAD
  try {
    await connectDB();
    await sequelize.sync({
      // alter: true, // for dev
      // force: true, // for prod
    });
    console.log("Database synchronized successfully!");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1); // Thoát ứng dụng nếu không thể đồng bộ
  }
=======
  await connectDB();
<<<<<<< HEAD
  await sequelize.sync({ 
    // alter: true 
  });
  console.log("Syn DB");
=======

  await sequelize.sync({
    //  alter: true, // for dev
    // force: true, // for prod
  });
  // console.log("Syn DB");
>>>>>>> 18b2add287b61db8ca3000a7522c63228fe24c6c
>>>>>>> develop
}
syncDB();

export { sequelize, connectDB };
