import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"; // ✅ Import Contact Routes
import { adminAuth } from "./middlewares/authMiddleware.js";
import { setupRoomAssociations } from "./models/Room.js";
import { setupAssociations as setupBookingAssociations } from "./models/Booking.js";

const app = express();

// ✅ Fix `__dirname` for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// ✅ Session-based Authentication (Ensuring session is configured properly)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // ✅ Set to true in production with HTTPS
  })
);

// ✅ Debugging Middleware (Logs Requests)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  console.log("🛠️ User in Session:", req.session.user || "No user in session");
  next();
});

// ✅ Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Serve static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public/images"))); // ✅ Ensure images are served

// ✅ Serve Service Worker explicitly (Fix MIME type issues)
app.get("/service-worker.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "public", "service-worker.js"));
});

// ✅ Serve Manifest.json explicitly
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "public", "manifest.json"));
});

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/admin", adminAuth, adminRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/contact", contactRoutes); // ✅ Added Contact Route

// ✅ Home Route
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// ✅ Admin Dashboard Route (Protected)
app.get("/admin/dashboard", adminAuth, (req, res) => {
  console.log("🛡️ Admin Authenticated:", req.user);

  if (!req.user || (req.user.role !== "super_admin" && req.user.role !== "admin")) {
    console.log("❌ Access Denied for:", req.user);
    return res.status(403).send("❌ Access Denied");
  }

  res.render("admin/dashboard");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // ✅ Setup relationships before syncing
    setupRoomAssociations();
    setupBookingAssociations();

    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Database models synced successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
