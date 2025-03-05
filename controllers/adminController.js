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

// ✅ Fetch All Bookings for Admin (Fix for undefined User/Room)
export const getAllBookings = async (req, res) => {
    try {
        console.log("🔍 Fetching all bookings...");
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ["id", "name", "email"], required: false }, // ✅ Ensures missing User doesn't crash
                { model: Room, attributes: ["id", "room_number", "type"], required: false }, // ✅ Ensures missing Room doesn't crash
            ],
            order: [["check_in_date", "DESC"]],
        });

        console.log(`✅ Found ${bookings.length} bookings.`);

        // ✅ Log any missing user or room for debugging
        bookings.forEach((booking) => {
            if (!booking.User) console.warn(`⚠️ Booking ID ${booking.id} has no User assigned!`);
            if (!booking.Room) console.warn(`⚠️ Booking ID ${booking.id} has no Room assigned!`);
        });

        res.render("admin/booking", { bookings });
    } catch (error) {
        console.error("❌ Error fetching bookings:", error.message);
        res.status(500).send("Internal Server Error: Unable to fetch bookings.");
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

// ✅ Approve Booking
export const approveBooking = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`✔ Approving Booking ID=${id}`);

        const booking = await Booking.findByPk(id);
        if (!booking) {
            console.log(`❌ Booking ID=${id} not found.`);
            return res.status(404).send("Booking not found.");
        }

        booking.status = "approved";
        await booking.save();

        console.log(`✅ Booking Approved: ID=${id}`);
        res.redirect("/admin/bookings");
    } catch (error) {
        console.error("❌ Error approving booking:", error.message);
        res.status(500).send("Internal Server Error: Unable to approve booking.");
    }
};

// ✅ Cancel Booking
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`❌ Cancelling Booking ID=${id}`);

        const booking = await Booking.findByPk(id);
        if (!booking) {
            console.log(`❌ Booking ID=${id} not found.`);
            return res.status(404).send("Booking not found.");
        }

        booking.status = "canceled";
        await booking.save();

        console.log(`✅ Booking Canceled: ID=${id}`);
        res.redirect("/admin/bookings");
    } catch (error) {
        console.error("❌ Error canceling booking:", error.message);
        res.status(500).send("Internal Server Error: Unable to cancel booking.");
    }
};

// ✅ Get Pending Admins (Super Admin Approval)
export const getPendingAdmins = async (req, res) => {
    try {
        console.log("🔍 Fetching pending admin approvals...");
        const pendingAdmins = await User.findAll({ where: { role: "pending_admin", approved: false } });

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

        admin.role = "admin"; // ✅ Change role from pending_admin to admin
        admin.approved = true; // ✅ Mark as approved
        await admin.save();

        console.log(`✅ Admin Approved Successfully: Email=${admin.email}`);
        res.redirect("/admin/pending-admins");
    } catch (error) {
        console.error(`❌ Error approving admin ID=${req.params.id}:`, error.message);
        res.status(500).send("Internal Server Error: Unable to approve admin.");
    }
};
