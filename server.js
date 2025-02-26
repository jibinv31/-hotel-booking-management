require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const { sequelize } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

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

// Routes
app.use("/auth", authRoutes);

// Sync Sequelize Models
(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log(
      "✅ Database models synced successfully (without altering structure)"
    );
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
})();

// Home Route
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
