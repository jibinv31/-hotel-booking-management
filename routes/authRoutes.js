import express from "express";
import {
  showSignupPage,
  showAdminSignupPage,
  signup,
  adminSignup,
  showLoginPage,
  showAdminLoginPage,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();

// ✅ User Signup
router.get("/signup", showSignupPage);
router.post("/signup", signup);

// ✅ Admin Signup (Needs Approval)
router.get("/admin-signup", showAdminSignupPage);
router.post("/admin-signup", adminSignup);

// ✅ User Login
router.get("/login", showLoginPage);
router.post("/login", login);

// ✅ Admin Login
router.get("/admin-login", showAdminLoginPage);
router.post("/admin-login", login);

router.get("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
