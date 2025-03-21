import jwt from "jsonwebtoken";
import User from "../models/auth.user.model.js";

// ✅ Middleware: Protect Routes (Require Auth)
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from DB
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found!" });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, invalid token!" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token!" });
    }
};

// ✅ Middleware: Restrict Access to Admin Only
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); // ✅ User is admin, proceed
    } else {
        res.status(403).json({ message: "Access denied! Admins only." });
    }
};