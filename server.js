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
// STAGE 1: READ ENDPOINTS (GET)
// ==========================================

// GET All Tasks
app.get("/tasks", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM tasks ORDER BY id"
        );

        res.json(
            result.rows.map(task => ({
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
        const result = await db.query(
            "SELECT * FROM tasks WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const task = result.rows[0];

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
// STAGE 2: CREATE TASK (POST)
// ==========================================

app.post("/tasks", async (req, res) => {

    if (!req.body || !req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const title = req.body.title.trim();

    try {
        const result = await db.query(
            `INSERT INTO tasks (title, done)
             VALUES ($1, $2)
             RETURNING id`,
            [title, 0]
        );

        res.status(201).json({
            id: result.rows[0].id,
            title: title,
            completed: false
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

app.put("/tasks/:id", async (req, res) => {

    if (!req.body || !req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const title = req.body.title.trim();
    const done = req.body.completed ? 1 : 0;

    try {
        const result = await db.query(
            `UPDATE tasks
             SET title = $1, done = $2
             WHERE id = $3`,
            [title, done, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            id: Number(req.params.id),
            title: title,
            completed: req.body.completed === true
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

app.delete("/tasks/:id", async (req, res) => {

    try {
        const result = await db.query(
            "DELETE FROM tasks WHERE id = $1",
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

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