import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// ✅ Nodemailer Transporter (For Admin Approval Emails)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Generate Access & Refresh Tokens
const generateTokens = (user) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error("❌ ERROR: JWT_SECRET or JWT_REFRESH_SECRET is missing in .env file");
    throw new Error("Server misconfiguration: JWT secrets missing");
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );

  console.log("🔑 Generated Tokens -> Access:", accessToken, "Refresh:", refreshToken);
  return { accessToken, refreshToken };
};

// ✅ Show Signup Page
export const showSignupPage = (req, res) => {
  res.render("signup");
};

// ✅ Show Admin Signup Page
export const showAdminSignupPage = (req, res) => {
  res.render("admin-signup");
};

// ✅ Handle User Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🔍 User Signup Attempt:", name, email);

    if (!name || !email || !password) {
      console.log("❌ Signup Failed: Missing Fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("❌ Signup Failed: Email Already Exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "guest",
    });

    console.log("✅ User Signup Successful:", newUser.email);
    res.redirect("/auth/login");
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Handle Admin Signup
export const adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🔍 Admin Signup Attempt:", name, email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let role = "pending_admin";
    const adminExists = await User.findOne({ where: { role: "super_admin" } });

    if (!adminExists) {
      role = "super_admin";
    }

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      approved: role === "super_admin",
    });

    console.log("✅ Admin Signup Successful:", newAdmin.email);

    if (role === "pending_admin") {
      const approvalLink = `http://localhost:3000/admin/approve?email=${email}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Admin Approval Required",
        text: `A new admin signup request from ${name} (${email}). Approve this admin from the dashboard or click: ${approvalLink}`,
      });

      console.log("📧 Approval email sent to Super Admin");
      return res.send("Admin signup successful. Awaiting super admin approval.");
    }

    res.redirect("/auth/admin-login");
  } catch (error) {
    console.error("❌ Admin Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Show Login Page
export const showLoginPage = (req, res) => {
  res.render("login");
};

// ✅ Show Admin Login Page
export const showAdminLoginPage = (req, res) => {
  res.render("admin-login");
};

// ✅ Handle Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Login Attempt:", email);

    if (!email || !password) {
      console.log("❌ Login Failed: Missing Credentials");
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("❌ Login Failed: No user found.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ User Found:", user.email, "Role:", user.role);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ Login Failed: Incorrect Password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role === "pending_admin") {
      console.log("⚠️ Admin approval pending.");
      return res.status(403).json({ message: "Admin approval pending." });
    }

    console.log("✅ Login Successful:", user.email);

    const tokens = generateTokens(user);
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect(user.role === "admin" || user.role === "super_admin" ? "/admin/dashboard" : "/");
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Logout
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("refreshToken");
    res.redirect("/");
  });
};

// ✅ Refresh Token Handler
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(403).json({ message: "User not found" });

      const newTokens = generateTokens(user);
      res.cookie("refreshToken", newTokens.refreshToken, { httpOnly: true });

      res.json({ accessToken: newTokens.accessToken });
    });
  } catch (error) {
    console.error("❌ Refresh Token Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
