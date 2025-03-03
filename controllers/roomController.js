import { Room } from "../models/Room.js";
import { Booking } from "../models/Booking.js";

// ✅ Get Available Rooms (For Users)
export const getAvailableRooms = async (req, res) => {
  try {
    console.log("🔍 Fetching available rooms for users...");

    const { check_in_date, check_out_date, roomType } = req.query;

    // ✅ Fetch available rooms (Filter by type if selected)
    const whereClause = { status: "available" };
    if (roomType) whereClause.type = roomType;

    const rooms = await Room.findAll({ where: whereClause });

    console.log(`✅ Found ${rooms.length} available rooms`);

    // ✅ Set default dates if missing
    const defaultCheckIn = check_in_date || new Date().toISOString().split("T")[0];
    const defaultCheckOut = check_out_date || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];

    res.render("rooms", {
      rooms,
      check_in_date: defaultCheckIn,
      check_out_date: defaultCheckOut,
      user: req.user
    });

  } catch (error) {
    console.error("❌ Error fetching available rooms:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Get All Rooms (For Admin)
export const getAllRooms = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      console.log("⛔ Unauthorized access to admin rooms.");
      return res.status(403).send("Unauthorized");
    }

    console.log("🔍 Fetching all rooms for admin...");
    const rooms = await Room.findAll();

    console.log(`✅ Found ${rooms.length} rooms`);
    res.render("admin/rooms", { rooms, admin: req.user });
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Get Room By ID (Admin View)
export const getRoomById = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      console.log("⛔ Unauthorized access to room details.");
      return res.status(403).send("Unauthorized");
    }

    const { id } = req.params;
    console.log(`🔍 Fetching details for Room ID: ${id}`);

    const room = await Room.findByPk(id);
    if (!room) {
      console.log("❌ Room not found");
      return res.status(404).send("Room not found");
    }

    console.log("✅ Room details retrieved:", room);
    res.render("admin/room-details", { room });
  } catch (error) {
    console.error("❌ Error fetching room details:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Create Room (Admin Only)
export const createRoom = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      console.log("⛔ Unauthorized: Only admins can create rooms.");
      return res.status(403).send("Unauthorized");
    }

    const { room_number, type, price, status } = req.body;
    console.log(`📌 Creating Room: ${room_number}, Type: ${type}, Price: $${price}, Status: ${status}`);

    const newRoom = await Room.create({ room_number, type, price, status });

    console.log(`✅ Room Created: ${newRoom.room_number}`);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("❌ Error creating room:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Update Room (Admin Only)
export const updateRoom = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      console.log("⛔ Unauthorized: Only admins can update rooms.");
      return res.status(403).send("Unauthorized");
    }

    const { id } = req.params;
    const { room_number, type, price, status } = req.body;

    console.log(`🔄 Updating Room ID: ${id}`);
    const room = await Room.findByPk(id);

    if (!room) {
      console.log("❌ Room not found.");
      return res.status(404).send("Room not found");
    }

    await room.update({ room_number, type, price, status });

    console.log(`✅ Room Updated: ID=${id}`);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Delete Room (Admin Only)
export const deleteRoom = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      console.log("⛔ Unauthorized: Only admins can delete rooms.");
      return res.status(403).send("Unauthorized");
    }

    const { id } = req.params;
    console.log(`🗑️ Deleting Room ID: ${id}`);

    const room = await Room.findByPk(id);
    if (!room) {
      console.log("❌ Room not found.");
      return res.status(404).send("Room not found");
    }

    await room.destroy();
    console.log(`✅ Room Deleted: ID=${id}`);
    res.redirect("/admin/rooms");
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).send("Server error");
  }
};
