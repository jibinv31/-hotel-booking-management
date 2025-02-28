import Room from "../models/Room.js";

// ✅ Get All Rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Create a Room
export const createRoom = async (req, res) => {
  try {
    console.log("📌 Incoming Request Body:", req.body); // Debug incoming data

    // ✅ Destructure and rename fields to match DB columns
    const { roomNumber, roomType, price, availability } = req.body;

    // ✅ Check if all fields are provided
    if (!roomNumber || !roomType || !price || availability === undefined) {
      return res.status(400).json({
        message: "Missing required fields",
        receivedData: req.body, // Debugging aid
      });
    }

    // ✅ Ensure field names match the Sequelize model
    const newRoom = await Room.create({
      room_number: roomNumber, // ✅ Maps request field to DB column
      type: roomType, // ✅ Maps request field to DB column
      price,
      availability,
    });

    res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("❌ Error creating room:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
