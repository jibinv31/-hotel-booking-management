import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";
import User from "../models/User.js";

// ✅ Admin Dashboard
export const getDashboard = async (req, res) => {
    try {
        const totalRooms = await Room.count();
        const totalBookings = await Booking.count();
        const totalRevenue = await Booking.sum("amountPaid") || 0;

        console.log("📊 Dashboard Data:", { totalRooms, totalBookings, totalRevenue });

        res.render("admin/dashboard", { totalRooms, totalBookings, totalRevenue });
    } catch (error) {
        console.error("❌ Error loading dashboard:", error.message);
        res.status(500).send("Internal Server Error: Unable to load dashboard.");
    }
};

// ✅ Get All Rooms
export const getAllRooms = async (req, res) => {
    try {
        console.log("🔍 Fetching all rooms...");
        const rooms = await Room.findAll();

        console.log(`✅ Found ${rooms.length} rooms.`);
        res.render("admin/rooms", { rooms });
    } catch (error) {
        console.error("❌ Error fetching rooms:", error.message);
        res.status(500).send("Internal Server Error: Unable to fetch rooms.");
    }
};

// ✅ Create Room
export const createRoom = async (req, res) => {
    try {
        const { room_number, type, price, status } = req.body;

        console.log(`📌 Creating Room: Number=${room_number}, Type=${type}, Price=$${price}, Status=${status}`);

        await Room.create({ room_number, type, price, status });

        console.log(`✅ Room Created Successfully: ${room_number}`);
        res.redirect("/admin/rooms");
    } catch (error) {
        console.error("❌ Error creating room:", error.message);
        res.status(500).send("Internal Server Error: Unable to create room.");
    }
};

// ✅ Update Room
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, type, price, status } = req.body;

        console.log(`🔄 Updating Room: ID=${id}, New Data → Room=${room_number}, Type=${type}, Price=$${price}, Status=${status}`);

        const room = await Room.findByPk(id);
        if (!room) {
            console.log(`❌ Room not found with ID: ${id}`);
            return res.status(404).send(`Room with ID ${id} not found.`);
        }

        await room.update({ room_number, type, price, status });

        console.log(`✅ Room Updated Successfully: ID=${id}`);
        res.redirect("/admin/rooms");
    } catch (error) {
        console.error(`❌ Error updating room ID=${req.params.id}:`, error.message);
        res.status(500).send("Internal Server Error: Unable to update room.");
    }
};

// ✅ Delete Room
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Attempting to delete Room ID=${id}`);

        const room = await Room.findByPk(id);
        if (!room) {
            console.log(`❌ Room not found with ID: ${id}`);
            return res.status(404).send(`Room with ID ${id} not found.`);
        }

        await room.destroy();
        console.log(`✅ Room Deleted Successfully: ID=${id}`);
        res.redirect("/admin/rooms");
    } catch (error) {
        console.error(`❌ Error deleting room ID=${req.params.id}:`, error.message);
        res.status(500).send("Internal Server Error: Unable to delete room.");
    }
};

// ✅ Get Pending Admins (Super Admin Approval)
export const getPendingAdmins = async (req, res) => {
    try {
        console.log("🔍 Fetching pending admin approvals...");
        const pendingAdmins = await User.findAll({ where: { approved: false } });

        console.log(`✅ Found ${pendingAdmins.length} pending admins.`);
        res.render("admin/pending-admins", { pendingAdmins });
    } catch (error) {
        console.error("❌ Error fetching pending admins:", error.message);
        res.status(500).send("Internal Server Error: Unable to fetch pending admins.");
    }
};

// ✅ Approve Admin (Super Admin Only)
export const approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔄 Attempting to approve admin with ID=${id}`);

        const admin = await User.findByPk(id);
        if (!admin) {
            console.log(`❌ Admin not found with ID: ${id}`);
            return res.status(404).send(`Admin with ID ${id} not found.`);
        }

        admin.role = "admin";
        admin.approved = true;
        await admin.save();

        console.log(`✅ Admin Approved Successfully: Email=${admin.email}`);
        res.redirect("/admin/pending-admins");
    } catch (error) {
        console.error(`❌ Error approving admin ID=${req.params.id}:`, error.message);
        res.status(500).send("Internal Server Error: Unable to approve admin.");
    }
};
