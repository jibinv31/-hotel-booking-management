import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Booking = sequelize.define(
  "bookings",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    room_id: { type: DataTypes.INTEGER, allowNull: false },
    check_in_date: { type: DataTypes.DATE, allowNull: false },
    check_out_date: { type: DataTypes.DATE, allowNull: false },
    amountPaid: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "canceled"),
      defaultValue: "pending",
    },
  },
  { timestamps: false }
);

// ✅ Define relationships inside an async function
const setupAssociations = async () => {
  const { Room } = await import("./Room.js"); // ✅ Correct async import

  User.hasMany(Booking, { foreignKey: "user_id" });
  Booking.belongsTo(User, { foreignKey: "user_id" });

  Room.hasMany(Booking, { foreignKey: "room_id" });
  Booking.belongsTo(Room, { foreignKey: "room_id" });

  console.log("🔗 Booking Associations Set Up Successfully");
};

// ✅ Export as named exports
export { Booking, setupAssociations };
