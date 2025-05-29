import { DataTypes } from "sequelize";
import { sequelize } from "../configs/connectRDS.js";

const Call = sequelize.define(
  "call",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    caller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    call_type: {
      type: DataTypes.ENUM("VOICE", "VIDEO"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("INITIATED", "MISSED", "REJECTED", "COMPLETED"),
      allowNull: false,
      defaultValue: "INITIATED",
    },
  },
  {
    timestamps: true,
  }
);

export default Call;