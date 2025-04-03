const { sequelize } = require("./connectRDS");

async function syncDB() {
  try {
    await sequelize.sync({ alter: true }); // Cập nhật cau truc bang mà không mất dữ liệu
    console.log("Database synchronized!");
  } catch (error) {
    console.error("Error sync database:", error.message);
  } finally {
    process.exit();
  }
}

module.exports = { syncDB };
