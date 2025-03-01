import { Booking } from "../models/Booking.js"; // ✅ Correct named import
import { Room } from "../models/Room.js"; // ✅ Ensure named import for Room
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
        console.error("❌ Error loading dashboard:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Get Pending Admins (For Super Admin)
export const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await User.findAll({ where: { role: "pending_admin" } });
        res.render("admin/admin-approval", { pendingAdmins });
    } catch (error) {
        console.error("❌ Error fetching pending admins:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Approve Admin (Super Admin Only)
export const approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findByPk(id);

        if (!admin) {
            return res.status(404).send("❌ Admin not found");
        }

        admin.role = "admin";
        admin.approved = true;
        await admin.save();

        console.log(`✅ Admin Approved: ${admin.email}`);

        res.redirect("/admin/pending-admins");
    } catch (error) {
        console.error("❌ Error approving admin:", error);
        res.status(500).send("Server error");
    }
};
