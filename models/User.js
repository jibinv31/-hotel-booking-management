import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // ✅ Fixed Import

const User = sequelize.define(
  "users",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("guest", "admin"), defaultValue: "guest" },
  },
  { timestamps: false }
);

export default User; // ✅ Use `export default`
