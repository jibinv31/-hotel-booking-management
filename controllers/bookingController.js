import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";
import User from "../models/User.js";

// ✅ Get User Bookings (Users can view their own bookings)
export const getUserBookings = async (req, res) => {
  try {
    console.log("🔍 Fetching user bookings for:", req.user.id);
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Room, attributes: ["room_number", "type", "price"] }],
    });

    console.log("✅ Retrieved User Bookings:", bookings.length);
    res.render("booking", { bookings, user: req.user });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Get All Bookings (Admin View)
export const getAllBookings = async (req, res) => {
  try {
    console.log("🔍 Fetching all bookings for admin");
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Room, attributes: ["room_number", "type"] },
      ],
    });

    console.log("✅ Retrieved Admin Bookings:", bookings.length);
    res.render("admin/bookings", { bookings, admin: req.user });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Get Booking By ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching booking details for ID:", id);

    const booking = await Booking.findByPk(id, {
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Room, attributes: ["room_number", "type"] },
      ],
    });

    if (!booking) {
      console.log("❌ Booking Not Found:", id);
      return res.status(404).send("Booking not found");
    }

    console.log("✅ Booking Details:", booking);
    res.render("booking-details", { booking });
  } catch (error) {
    console.error("❌ Error fetching booking details:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Create Booking (User) and Redirect to Payment
export const createBooking = async (req, res) => {
  try {
    console.log("📅 Creating booking:", req.body);
    const { room_id, check_in_date, check_out_date } = req.body;

    const newBooking = await Booking.create({
      user_id: req.user.id,
      room_id,
      check_in_date,
      check_out_date,
      status: "pending",
    });

    console.log(`✅ Booking Created: ID=${newBooking.id}`);

    // Redirect to payment page
    res.redirect(`/payments/new?booking_id=${newBooking.id}&amount=100`);
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Update Booking (Only before check-in)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("✏️ Updating booking ID:", id);
    const { check_in_date, check_out_date } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking || booking.status !== "pending") {
      return res.status(403).send("Cannot modify this booking.");
    }

    await booking.update({ check_in_date, check_out_date });

    console.log(`✅ Booking Updated: ID=${id}`);
    res.redirect("/bookings");
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Cancel Booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Deleting booking ID:", id);
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).send("Booking not found");

    await booking.destroy();
    console.log(`❌ Booking Deleted: ID=${id}`);
    res.redirect("/bookings");
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Approve Booking (Admin)
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("✅ Approving booking ID:", id);

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).send("Booking not found");

    await booking.update({ status: "confirmed" });

    console.log(`✅ Booking Approved: ID=${id}`);
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error("❌ Error approving booking:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Cancel Booking (Admin)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("❌ Canceling booking ID:", id);

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).send("Booking not found");

    await booking.update({ status: "canceled" });

    console.log(`❌ Booking Canceled: ID=${id}`);
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error("❌ Error canceling booking:", error);
    res.status(500).send("Server error");
  }
};
