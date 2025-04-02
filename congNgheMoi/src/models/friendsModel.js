import { DataTypes } from "sequelize";
import { sequelize } from "../configs/connectRDS";

const User = require("./userModel");

const Friend = sequelize.define("Friend", {
  user_id: { type: DataTypes.INTEGER },
  friend_id: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "blocked"),
    defaultValue: "pending",
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
//set composite primary key
Friend.removeAttribute("id");
Friend.belongsTo(User, { foreignKey: "user_id" });
Friend.belongsTo(User, { foreignKey: "friend_id" });

module.exports = Friend;
