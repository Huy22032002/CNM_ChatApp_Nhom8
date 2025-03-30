const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/db");

const User = require("./userModel");

const UserDetail = sequelize.define("UserDetail", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true },
  fullname: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false },
  gender: { type: DataTypes.BOOLEAN, allowNull: false },
  avatar_url: { type: DataTypes.STRING, allowNull: true },
});

//set Foreign Key
User.hasOne(UserDetail, { foreignKey: "user_id" });
UserDetail.belongsTo(User, { foreignKey: "user_id" });

module.exports = UserDetail;
