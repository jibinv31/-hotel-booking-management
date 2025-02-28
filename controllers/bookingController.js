import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

// ✅ Create a Booking
export const createBooking = async (req, res) => {
  const { user_id, room_id, check_in_date, check_out_date, status } = req.body;
  try {
    const room = await Room.findByPk(room_id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.status === "booked") {
      return res.status(400).json({ message: "Room is already booked" });
    }

    const booking = await Booking.create({
      user_id,
      room_id,
      check_in_date,
      check_out_date,
      status: status || "pending",
    });

    await room.update({ status: "booked" });

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error Creating Booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Room },
      ],
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error Fetching Bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Room },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error Fetching Booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update a Booking
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await booking.update(req.body);
    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error("Error Updating Booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a Booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const room = await Room.findByPk(booking.room_id);
    if (room) await room.update({ status: "available" });

    await booking.destroy();
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
