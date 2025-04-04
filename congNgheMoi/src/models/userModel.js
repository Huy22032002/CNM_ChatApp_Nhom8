import { DataTypes } from "sequelize";
import { sequelize } from "../configs/connectRDS.js";
import { genSalt, hash } from "bcryptjs";

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
        const salt = await genSalt(10);
        user.pass_hash = await hash(user.pass_hash, salt);
      },
    },
  }
);

export default User;
