import { DataTypes } from "sequelize";
import { sequelize } from "../configs/connectRDS.js";
import User from "./userModel.js";

const Notification = sequelize.define("Notification", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, primaryKey: true,allowNull: false },
    message: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM("FRIEND_REQUEST", "MESSAGE", "OTHER") },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM("PENDING", "DONE") },
});

// Set Foreign Key
User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

export default Notification;