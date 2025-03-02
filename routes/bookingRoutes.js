import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  approveBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { verifyToken, adminAuth } from "../middlewares/authMiddleware.js";
import { getAllRooms } from "../controllers/roomController.js";

const router = express.Router();

// ✅ User: View Their Bookings
router.get("/", verifyToken, getUserBookings);

// ✅ Separate Room Selection Page (Before Booking)
router.get("/select-room", verifyToken, async (req, res) => {
  try {
    const rooms = await getAllRooms();
    res.render("room-selection", { rooms, user: req.user });
  } catch (error) {
    console.error("❌ Error loading rooms:", error);
    res.status(500).send("Server error");
  }
});

// ✅ Create a Booking (User)
router.post("/create", verifyToken, createBooking);

// ✅ Get Booking Details (User & Admin)
router.get("/:id", verifyToken, getBookingById);

// ✅ Update Booking (User - Only before check-in)
router.put("/:id", verifyToken, updateBooking);

// ✅ Cancel Booking (User)
router.delete("/:id", verifyToken, deleteBooking);

// ✅ Admin: Manage Bookings
router.get("/admin", adminAuth, getUserBookings);
router.post("/admin/approve/:id", adminAuth, approveBooking);
router.post("/admin/cancel/:id", adminAuth, cancelBooking);

export default router;
