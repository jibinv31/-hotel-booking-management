import User from "../models/User.js";

// ✅ Get Pending Admins (For Super Admin)
export const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await User.findAll({ where: { role: "pending_admin" } });
        res.render("admin-approval", { pendingAdmins });
    } catch (error) {
        console.error("Error fetching pending admins:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Approve Admin (Super Admin Only)
export const approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findByPk(id);

        if (!admin) {
            return res.status(404).send("Admin not found");
        }

        admin.role = "admin";
        admin.approved = true;
        await admin.save();

        res.redirect("/admin/pending-admins");
    } catch (error) {
        console.error("Error approving admin:", error);
        res.status(500).send("Server error");
    }
};
