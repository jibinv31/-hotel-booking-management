import jwt from "jsonwebtoken";

// ✅ Middleware to Verify Admin Access
export const adminAuth = (req, res, next) => {
    const token = req.cookies.accessToken; // ✅ Get token from cookies
    if (!token) return res.status(401).send("Access Denied.");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== "admin" && verified.role !== "super_admin") {
            return res.status(403).send("Forbidden. Admins only.");
        }
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send("Invalid token.");
    }
};

// ✅ Middleware to Verify Any Logged-in User
export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).send("Access Denied.");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send("Invalid token.");
    }
};
