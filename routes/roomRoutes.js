import express from "express";
import { adminAuth, verifyToken } from "../middlewares/authMiddleware.js";
import {
    getAvailableRooms,
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
} from "../controllers/roomController.js";

const router = express.Router();

/** ===========================
 *  ✅ User Routes (View Available Rooms)
 *  =========================== */
router.get("/", verifyToken, getAvailableRooms);

/** ===========================
 *  ✅ Admin Routes (Manage Rooms)
 *  =========================== */
router.get("/admin", adminAuth, getAllRooms);
router.get("/admin/:id", adminAuth, getRoomById);
router.post("/admin/create", adminAuth, createRoom);
router.post("/admin/update/:id", adminAuth, updateRoom);
router.post("/admin/delete/:id", adminAuth, deleteRoom);

export default router;
