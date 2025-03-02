import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to Verify Admin Access
export const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            console.log("❌ No accessToken found.");
            return res.status(401).send("Access Denied.");
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.log("❌ Invalid Token:", err);
                return res.status(403).send("Invalid Token");
            }

            const user = await User.findByPk(decoded.id);
            if (!user) {
                console.log("❌ User not found.");
                return res.status(403).send("User Not Found");
            }

            if (user.role !== "admin" && user.role !== "super_admin") {
                console.log("❌ Forbidden: User is not an admin.");
                return res.status(403).send("Forbidden. Admins only.");
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error("❌ Admin Auth Middleware Error:", error);
        res.status(500).send("Server Error");
    }
};

// ✅ Middleware to Verify Any Logged-in User
export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        console.log("❌ No token found. User not logged in.");
        return res.status(401).send("Access Denied.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("❌ Invalid token:", error);
        res.status(400).send("Invalid token.");
    }
};
