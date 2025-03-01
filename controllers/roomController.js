import { Room } from "../models/Room.js"; // ✅ Fix Import
import { Booking } from "../models/Booking.js";

// ✅ Get All Rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.render("admin/rooms", { rooms });
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Get Room By ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).send("Room not found");

    res.render("admin/room-details", { room });
  } catch (error) {
    console.error("❌ Error fetching room details:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Create Room
export const createRoom = async (req, res) => {
  try {
    const { room_number, type, price, status } = req.body;
    const newRoom = await Room.create({ room_number, type, price, status });

    console.log(`✅ Room Created: ${newRoom.room_number}`);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("❌ Error creating room:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Update Room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, type, price, status } = req.body;

    const room = await Room.findByPk(id);
    if (!room) return res.status(404).send("Room not found");

    await room.update({ room_number, type, price, status });

    console.log(`✅ Room Updated: ${room.room_number}`);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).send("Room not found");

    await room.destroy();
    console.log(`❌ Room Deleted: ${id}`);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).send("Server error");
  }
};
