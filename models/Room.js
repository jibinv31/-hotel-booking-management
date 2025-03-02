import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { Booking } from "./Booking.js"; // ✅ Import Booking correctly

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "unique_room_number", // ✅ Ensures Sequelize does NOT recreate multiple unique constraints
        msg: "Room number must be unique", // ✅ Custom error message for duplicate entries
      },
    },
    type: {
      type: DataTypes.ENUM("single", "double", "suite", "deluxe"),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "booked"),
      defaultValue: "available",
    },
  },
  { timestamps: false }
);

// ✅ Define relationships inside an exported function to avoid circular dependencies
const setupRoomAssociations = () => {
  Room.hasMany(Booking, { foreignKey: "room_id", onDelete: "CASCADE" });
  Booking.belongsTo(Room, { foreignKey: "room_id" });

  console.log("🔗 Room Associations Set Up Successfully");
};

// ✅ Export as named export
export { Room, setupRoomAssociations };
