import express from "express";
import { adminAuth } from "../middlewares/authMiddleware.js";
import {
    getDashboard,
    getPendingAdmins,
    approveAdmin,
    getAllRooms,
    createRoom,
    deleteRoom,
    updateRoom,
    getAllBookings, // ✅ Ensure bookings route is added
    approveBooking,
    cancelBooking
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin Dashboard (Protected)
router.get("/dashboard", adminAuth, getDashboard);

// ✅ Pending Admins Approval (Super Admin Only)
router.get("/pending-admins", adminAuth, getPendingAdmins);
router.post("/approve-admin/:id", adminAuth, approveAdmin);

// ✅ Manage Rooms
router.get("/rooms", adminAuth, getAllRooms);
router.post("/rooms/create", adminAuth, createRoom);
router.post("/rooms/edit/:id", adminAuth, updateRoom);
router.post("/rooms/delete/:id", adminAuth, deleteRoom);

// ✅ Manage Bookings (🔥 FIXED)
router.get("/bookings", adminAuth, getAllBookings);
router.post("/bookings/admin/approve/:id", adminAuth, approveBooking);
router.post("/bookings/admin/cancel/:id", adminAuth, cancelBooking);

export default router;
