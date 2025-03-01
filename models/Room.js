import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Booking from "./Booking.js"; // ✅ Import Booking correctly

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "unique_room_number" // ✅ Named unique constraint to avoid duplication
    },
    type: {
      type: DataTypes.ENUM("single", "double", "suite", "deluxe"), // ✅ Ensure consistency in ENUM values
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("available", "booked"),
      defaultValue: "available",
    },
  },
  { timestamps: false } // ✅ Ensures Sequelize does not automatically add timestamps
);

// ✅ Define Relationship AFTER declaring Room
Room.hasMany(Booking, { foreignKey: "room_id", onDelete: "CASCADE" });
Booking.belongsTo(Room, { foreignKey: "room_id" });

export default Room;
