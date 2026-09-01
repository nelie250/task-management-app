const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// Validate pagination params
const getPaginationParams = (query) => {
  let page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)); // Max 100 items
  return { page, limit, skip: (page - 1) * limit };
};

const validateTaskPayload = (title, priority, dueDate) => {
  const trimmedTitle = String(title ?? "").trim();

  if (!trimmedTitle) {
    throw new Error("Task title is required.");
  }

  if (trimmedTitle.length < 2 || trimmedTitle.length > 120) {
    throw new Error("Task title must be between 2 and 120 characters.");
  }

  if (priority && !["low", "medium", "high"].includes(priority)) {
    throw new Error("Priority must be low, medium, or high.");
  }

  // Validate due date if provided
  if (dueDate) {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid due date format.");
    }
  }
};

// GET all tasks for current user with pagination and search
router.get("/", async (req, res) => {
  try {
    const { q = "", filter = "all" } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    const userId = req.user.id;

    const findQuery = { userId }; // Filter by user ID

    // Apply search filter
    if (q && q.toString().trim()) {
      findQuery.title = { $regex: q.toString().trim(), $options: "i" };
    }

    // Apply status filter
    if (filter === "completed") {
      findQuery.completed = true;
    } else if (filter === "active") {
      findQuery.completed = false;
    }

    // Get total count for pagination
    const total = await Task.countDocuments(findQuery);

    const tasks = await Task.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});

// POST create new task
router.post("/", async (req, res) => {
  try {
    const { title, dueDate, priority, description } = req.body;
    const userId = req.user.id;

    validateTaskPayload(title, priority, dueDate);

    const task = await Task.create({
      userId,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      dueDate: dueDate || null,
      priority: priority || "medium",
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

// PUT update task
router.put("/:id", async (req, res) => {
  try {
    const { title, dueDate, priority, description } = req.body;
    const userId = req.user.id;

    validateTaskPayload(title, priority, dueDate);

    // Ensure user owns the task
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this task" });
    }

    const updatePayload = {
      title: String(title).trim(),
      priority: priority || "medium",
      dueDate: dueDate || null,
      description: description ? String(description).trim() : "",
    };

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true },
    );

    return res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(400).json({
      message: "Failed to edit task",
      error: error.message,
    });
  }
});

// PATCH toggle task completion
router.patch("/:id/toggle", async (req, res) => {
  try {
    const userId = req.user.id;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure user owns the task
    if (task.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this task" });
    }

    task.completed = !task.completed;
    await task.save();

    return res.json(task);
  } catch (error) {
    console.error("Toggle task error:", error);
    return res.status(400).json({
      message: "Failed to toggle task",
      error: error.message,
    });
  }
});

// DELETE task
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure user owns the task
    if (task.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(400).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
});

module.exports = router;
