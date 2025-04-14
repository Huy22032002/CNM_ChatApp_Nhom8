import { DataTypes } from "sequelize";
import { sequelize } from "../configs/connectRDS.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: {
    type: DataTypes.STRING.length(50),
    unique: true,
    allowNull: false,
    immutable: true,
  },
  pass_hash: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING.length(50), allowNull: false, unique: true },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      len: [10, 10], // phone 10 ký tự
    },
  },
  status: {
    type: DataTypes.ENUM("ONLINE", "OFFLINE"),
    defaultValue: "OFFLINE",
  },
});

export default User;
