const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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

module.exports = Room;
