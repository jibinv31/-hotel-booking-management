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
import { getAvailableRooms } from "../controllers/roomController.js";

const router = express.Router();

// ✅ User: View Their Own Bookings
router.get("/", verifyToken, getUserBookings);

// ✅ Room Selection Page (Before Booking)
router.get("/select-room", verifyToken, async (req, res) => {
  try {
    const rooms = await getAvailableRooms(); // ✅ Changed function to fetch only available rooms
    res.render("room-selection", { rooms, user: req.user });
  } catch (error) {
    console.error("❌ Error loading available rooms:", error);
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

// ✅ Admin: Manage All User Bookings
router.get("/admin/all", adminAuth, getUserBookings);
router.post("/admin/approve/:id", adminAuth, approveBooking);
router.post("/admin/cancel/:id", adminAuth, cancelBooking);

export default router;
