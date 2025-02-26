import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Booking from "./Booking.js"; // ✅ Import Booking correctly

const Room = sequelize.define(
  "rooms",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    room_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    type: {
      type: DataTypes.ENUM("single", "double", "suite"),
      allowNull: false,
    },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("available", "booked"),
      defaultValue: "available",
    },
  },
  { timestamps: false }
);

// ✅ Define Relationship AFTER declaring Room
Room.hasMany(Booking, { foreignKey: "room_id" });
Booking.belongsTo(Room, { foreignKey: "room_id" });

export default Room;
