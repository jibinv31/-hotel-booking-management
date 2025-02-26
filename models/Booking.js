const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Room = require("./Room");

const Booking = sequelize.define(
  "bookings",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    room_id: { type: DataTypes.INTEGER, allowNull: false },
    check_in: { type: DataTypes.DATEONLY, allowNull: false },
    check_out: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
      defaultValue: "pending",
    },
  },
  { timestamps: false }
);

// Define Relationships
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Room.hasMany(Booking, { foreignKey: "room_id" });
Booking.belongsTo(Room, { foreignKey: "room_id" });

module.exports = Booking;
