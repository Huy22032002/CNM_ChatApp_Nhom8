import { DataTypes } from "sequelize";
import { sequelize } from "../configs/connectRDS.js";
import User from "./userModel.js";

const UserDetail = sequelize.define("UserDetail", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true },
  fullname: { type: DataTypes.STRING.length(50) },
  age: { type: DataTypes.INTEGER},
  gender: { type: DataTypes.BOOLEAN},
  avatar_url: { type: DataTypes.STRING},
});

// Set Foreign Key
User.hasOne(UserDetail, { foreignKey: "user_id" });
UserDetail.belongsTo(User, { foreignKey: "user_id" });

export default UserDetail;
