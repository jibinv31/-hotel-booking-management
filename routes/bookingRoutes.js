import express from "express";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  approveBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { verifyToken, adminAuth } from "../middlewares/authMiddleware.js";
import { getAvailableRooms } from "../controllers/roomController.js";

const router = express.Router();

// ✅ Redirect unauthenticated users to login when accessing booking
router.get("/search", (req, res) => {
  if (!req.session.user) {  // Check if user is logged in via session
    return res.redirect("/auth/login"); // Redirect to login page if not authenticated
  }

  // ✅ If logged in, proceed to room selection
  res.redirect("/booking/select-room");
});

// ✅ User: View Their Own Bookings
router.get("/", verifyToken, getUserBookings);

// ✅ Room Selection Page (Before Booking)
router.get("/select-room", verifyToken, async (req, res) => {
  try {
    const rooms = await getAvailableRooms();
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
router.post("/:id/update", verifyToken, updateBooking);

// ✅ Cancel Booking (User)
router.post("/:id/delete", verifyToken, deleteBooking);

// ✅ Admin: Manage All User Bookings
router.get("/admin/all", adminAuth, getAllBookings);
router.post("/admin/approve/:id", adminAuth, approveBooking);
router.post("/admin/cancel/:id", adminAuth, cancelBooking);

export default router;
