import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url"; // Needed to handle `__dirname`
import session from "express-session";
import bodyParser from "body-parser";
import sequelize from "./config/db.js"; // Fixed Import
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"; // ✅ Added Room Routes
import bookingRoutes from "./routes/bookingRoutes.js"; // ✅ Added Booking Routes

const app = express();

// Fix `__dirname` for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes); // ✅ Room Routes
app.use("/bookings", bookingRoutes); // ✅ Booking Routes

// ✅ Sync Sequelize Models
(async () => {
  try {
    await sequelize.sync({ alter: true }); // Updated: alter true to update models without losing data
    console.log("✅ Database models synced successfully");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
})();

// ✅ Home Route
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
