import express from "express";
import { postUser, loginUser } from "../controllers/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import User from "../models/auth.user.model.js";

const router = express.Router();

router.post("/register", postUser); // Register User
router.post("/login", loginUser);   // Login User

// ✅ Protected Route (Requires Auth)
router.get("/profile", protect, (req, res) => {
    res.json({ message: "Protected Profile Data", user: req.user });
});

// ✅ Admin-Only Route (Example: Get All Users)
router.get("/admin/users", protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
