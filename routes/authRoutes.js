import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ Show Signup Page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// ✅ Handle Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.redirect("/auth/login"); // Redirect to login page
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send("Server error");
  }
});

// ✅ Show Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Handle Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };

    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Server error");
  }
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
