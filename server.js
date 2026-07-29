const express = require("express");
const app = express();
const db = require("./database");

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// ==========================================
// STAGE 2: READ ENDPOINTS
// ==========================================

// GET All Tasks
app.get("/tasks", async (req, res) => {
    try {
        const rows = await db.getAllTasks();

        res.json(
            rows.map(task => ({
                id: task.id,
                title: task.title,
                completed: task.done === 1
            }))
        );

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// GET Single Task
app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await db.getTaskById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            id: task.id,
            title: task.title,
            completed: task.done === 1
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// ==========================================
// DEBUG ROUTE
// ==========================================

app.post("/test", (req, res) => {
    res.json({
        headers: req.headers,
        body: req.body
    });
});

// ==========================================
// STAGE 3: CREATE TASK
// ==========================================

// POST /tasks
app.post("/tasks", async (req, res) => {

    // Validation
    if (!req.body || !req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const title = req.body.title.trim();

    try {
        const task = await db.createTask(title);

        res.status(201).json({
            id: task.id,
            title: task.title,
            completed: task.done === 1
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// ==========================================
// STAGE 3: UPDATE TASK
// ==========================================

// PUT /tasks/:id
app.put("/tasks/:id", async (req, res) => {

    // Validation
    if (!req.body || !req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const title = req.body.title.trim();
    const done = req.body.completed === true ? 1 : 0;

    try {
        const task = await db.updateTask(
            req.params.id,
            title,
            done
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            id: task.id,
            title: task.title,
            completed: task.done === 1
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// ==========================================
// STAGE 3: DELETE TASK
// ==========================================

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {

    try {
        const task = await db.deleteTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Successful DELETE returns 204 with no response body
        res.status(204).send();

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});