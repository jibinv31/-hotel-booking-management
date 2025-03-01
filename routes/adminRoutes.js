import express from "express";
import { adminAuth } from "../middlewares/authMiddleware.js";
import {
    getDashboard,
    getPendingAdmins,
    approveAdmin
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin Dashboard (Protected)
router.get("/dashboard", adminAuth, getDashboard);

// ✅ Pending Admins Approval
router.get("/pending-admins", adminAuth, getPendingAdmins);
router.post("/approve-admin/:id", adminAuth, approveAdmin);

export default router;
