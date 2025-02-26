import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Room from "./Room.js"; // ✅ Import Room AFTER defining Booking
import User from "./User.js";

const Booking = sequelize.define(
  "bookings",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    room_id: { type: DataTypes.INTEGER, allowNull: false },
    check_in_date: { type: DataTypes.DATE, allowNull: false },
    check_out_date: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "canceled"),
      defaultValue: "pending",
    },
  },
  { timestamps: false }
);

// ✅ Define Relationships AFTER declaring Booking
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

export default Booking;
