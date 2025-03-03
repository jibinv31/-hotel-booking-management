import express from "express";
import { adminAuth } from "../middlewares/authMiddleware.js";
import {
    getDashboard,
    getPendingAdmins,
    approveAdmin,
    getAllRooms,
    createRoom,
    deleteRoom,
    updateRoom,  // ✅ Update Room Controller
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin Dashboard (Protected)
router.get("/dashboard", adminAuth, getDashboard);

// ✅ Pending Admins Approval
router.get("/pending-admins", adminAuth, getPendingAdmins);
router.post("/approve-admin/:id", adminAuth, approveAdmin);

// ✅ Manage Rooms
router.get("/rooms", adminAuth, getAllRooms);
router.post("/rooms/create", adminAuth, createRoom);
router.post("/rooms/edit/:id", adminAuth, updateRoom);  // ✅ FIXED: Corrected the edit route
router.post("/rooms/delete/:id", adminAuth, deleteRoom);

export default router;
