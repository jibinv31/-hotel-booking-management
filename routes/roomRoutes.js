import express from "express";
import { getAllRooms, createRoom } from "../controllers/roomController.js";

const router = express.Router();

// ✅ Get all rooms
router.get("/", getAllRooms);

// ✅ Create a room (Updated route to `/rooms` instead of `/rooms/create`)
router.post("/", createRoom);

export default router;
