import mongoose from "mongoose";
import Todo from "../models/todo.model.js";
import User from "../models/auth.user.model.js"; 

export const createTodo = async (req, res) => {
    const { title, description, priority, userId } = req.body;

    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only admins can create tasks." });
        }

        // ✅ Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format!" });
        }

        // ✅ Check if the assigned user exists
        const assignedUser = await User.findById(userId);
        if (!assignedUser) {
            return res.status(404).json({ message: "Assigned user not found!" });
        }

        const newTodo = new Todo({
            user: userId, 
            title,
            description,
            priority,
        });

        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Get all Todos for logged-in user
export const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update a Todo
export const updateTodo = async (req, res) => {
    const { title, description, completed, priority } = req.body;

    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found!" });
        }

        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized!" });
        }

        todo.title = title || todo.title;
        todo.description = description || todo.description;
        todo.completed = completed ?? todo.completed;
        todo.priority = priority || todo.priority;

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete a Todo
export const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found!" });
        }

        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized!" });
        }

        await todo.deleteOne();
        res.json({ message: "Todo deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
