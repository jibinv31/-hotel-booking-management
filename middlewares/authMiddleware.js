import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to Verify Admin Access with Token Refresh
export const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!token) {
            console.log("❌ No accessToken found.");
            return res.status(401).send("Access Denied.");
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    console.log("⚠️ Token Expired. Attempting Refresh...");

                    if (!refreshToken) {
                        console.log("❌ No Refresh Token. Logging Out.");
                        return res.redirect("/auth/logout");
                    }

                    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (refreshErr, refreshDecoded) => {
                        if (refreshErr) {
                            console.log("❌ Invalid Refresh Token.");
                            return res.redirect("/auth/logout");
                        }

                        const newAccessToken = jwt.sign(
                            { id: refreshDecoded.id, role: refreshDecoded.role },
                            process.env.JWT_SECRET,
                            { expiresIn: "15m" }
                        );

                        res.cookie("accessToken", newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            maxAge: 15 * 60 * 1000,
                        });

                        req.user = refreshDecoded;
                        next();
                    });
                } else {
                    console.log("❌ Invalid Token:", err.message);
                    return res.status(401).send("Invalid Token");
                }
            } else {
                console.log("✅ Token Verified:", decoded);
                req.user = decoded;

                if (req.user.role !== "admin" && req.user.role !== "super_admin") {
                    console.log("❌ Unauthorized Access Attempt");
                    return res.status(403).send("Access Denied: Admins Only");
                }

                next();
            }
        });
    } catch (error) {
        console.error("❌ Admin Auth Middleware Error:", error);
        res.status(500).send("Server Error");
    }
};

// ✅ Middleware to Verify User Token
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
