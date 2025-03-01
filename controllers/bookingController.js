import { Booking } from "../models/Booking.js"; // ✅ Named Import
import { Room } from "../models/Room.js";
import User from "../models/User.js"; // ✅ Default import (since User.js exports default)


// ✅ Controller functions remain the same...


// ✅ Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Room, attributes: ["room_number", "type"] },
      ],
    });

    console.log("✅ Retrieved Bookings:", bookings.length);
    res.render("admin/bookings", { bookings });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Get Booking By ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
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
    res.render("admin/booking-details", { booking });
  } catch (error) {
    console.error("❌ Error fetching booking details:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Create Booking
export const createBooking = async (req, res) => {
  try {
    const { user_id, room_id, check_in_date, check_out_date, amountPaid, status } = req.body;

    const newBooking = await Booking.create({
      user_id,
      room_id,
      check_in_date,
      check_out_date,
      amountPaid,
      status,
    });

    console.log(`✅ Booking Created: ID=${newBooking.id}, User=${user_id}, Room=${room_id}`);
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Update Booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, room_id, check_in_date, check_out_date, amountPaid, status } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      console.log("❌ Booking Not Found:", id);
      return res.status(404).send("Booking not found");
    }

    await booking.update({ user_id, room_id, check_in_date, check_out_date, amountPaid, status });

    console.log(`✅ Booking Updated: ID=${id}, New Status=${status}`);
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Delete Booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      console.log("❌ Booking Not Found:", id);
      return res.status(404).send("Booking not found");
    }

    await booking.destroy();
    console.log(`❌ Booking Deleted: ID=${id}`);
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).send("Server error");
  }
};
