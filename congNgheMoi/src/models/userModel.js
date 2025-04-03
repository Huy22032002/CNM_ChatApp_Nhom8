const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectRDS");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      immutable: true,
    },
    pass_hash: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.pass_hash = await bcrypt.hash(user.pass_hash, salt);
      },
    },
  }
);

module.exports = User;
