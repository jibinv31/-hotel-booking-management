import express from "express";
import Room from "../models/Room.js";

const router = express.Router();

// ✅ 1. Create a New Room
router.post("/create", async (req, res) => {
  const { room_number, type, price, status } = req.body;

  try {
    const room = await Room.create({ room_number, type, price, status });
    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 2. Get All Rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 3. Get a Single Room by ID
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 4. Update a Room
router.put("/:id", async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    await room.update(req.body);
    res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 5. Delete a Room
router.delete("/:id", async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    await room.destroy();
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
