import express from "express";
import {
  showSignupPage, showAdminSignupPage, signup, adminSignup,
  showLoginPage, showAdminLoginPage, login, adminLogin,
  logout, refreshToken
} from "../controllers/authController.js";

const router = express.Router();

// ✅ User Routes
router.get("/signup", showSignupPage);
router.post("/signup", signup);
router.get("/login", showLoginPage);
router.post("/login", login);

// ✅ Admin Routes (Fixed path issue)
router.get("/admin-signup", showAdminSignupPage);
router.post("/admin-signup", adminSignup);
router.get("/admin-login", showAdminLoginPage);
router.post("/admin-login", adminLogin);

// ✅ Extra routes to support `/auth/admin/login` for consistency
router.get("/admin/login", (req, res) => res.redirect("/auth/admin-login"));
router.post("/admin/login", (req, res) => res.redirect("/auth/admin-login"));
router.get("/admin/signup", (req, res) => res.redirect("/auth/admin-signup"));
router.post("/admin/signup", (req, res) => res.redirect("/auth/admin-signup"));

// ✅ Logout & Token Routes
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
