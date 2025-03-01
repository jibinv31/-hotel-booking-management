import express from "express";
import { adminAuth } from "../middlewares/authMiddleware.js";
import { getPendingAdmins, approveAdmin } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Route: View Pending Admins (Super Admin Only)
router.get("/pending-admins", adminAuth, getPendingAdmins);

// ✅ Route: Approve Admin (Super Admin Only)
router.post("/approve-admin/:id", adminAuth, approveAdmin);

export default router;
