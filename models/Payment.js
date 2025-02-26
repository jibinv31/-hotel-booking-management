import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Booking from "./Booking.js";

const Payment = sequelize.define(
  "payments",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_method: {
      type: DataTypes.ENUM("test_card", "paypal"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    transaction_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { timestamps: false }
);

// Define Relationship
Booking.hasOne(Payment, { foreignKey: "booking_id" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

export default Payment;
