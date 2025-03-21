import express from "express";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../controllers/todo.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Admin can create tasks for any user
router.post("/", protect, adminOnly, createTodo);

// ✅ Normal users can fetch, update, and delete their own tasks
router.get("/", protect, getTodos);
router.put("/:id", protect, updateTodo);
router.delete("/:id", protect, deleteTodo);

export default router;
