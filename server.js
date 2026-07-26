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
app.get("/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(
            rows.map(task => ({
                id: task.id,
                title: task.title,
                completed: task.done === 1
            }))
        );
    });
});

// GET Single Task
app.get("/tasks/:id", (req, res) => {
    db.get(
        "SELECT * FROM tasks WHERE id = ?",
        [req.params.id],
        (err, row) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                id: row.id,
                title: row.title,
                completed: row.done === 1
            });
        }
    );
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

app.post("/tasks", (req, res) => {

    console.log("==========================================");
    console.log("🔍 DIAGNOSTIC DEBUG LOG");
    console.log("Raw Headers:", req.headers);
    console.log("Parsed req.body Type:", typeof req.body);
    console.log("Parsed req.body Contents:", req.body);
    console.log("==========================================");

    if (!req.body || !req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const title = req.body.title.trim();

    db.run(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        [title, 0],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                id: this.lastID,
                title: title,
                completed: false
            });
        }
    );
});

// ==========================================
// STAGE 3: UPDATE & DELETE ENDPOINTS (PUT/DELETE)
// ==========================================

// PUT - Update a task title and completed state in the SQLite database
app.put("/tasks/:id", (req, res) => {
    if (!req.body || !req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const title = req.body.title.trim();
    // Convert incoming completed boolean (true/false) into SQLite integer (1/0)
    const done = req.body.completed ? 1 : 0; 

    db.run(
        "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
        [title, done, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // If zero rows were changed, it means the ID does not exist in the database
            if (this.changes === 0) {
                return res.status(404).json({ message: "Task not found" });
            }

            res.json({
                id: Number(req.params.id),
                title: title,
                completed: req.body.completed === true
            });
        }
    );
});

// DELETE - Remove a task from the SQLite database by ID
app.delete("/tasks/:id", (req, res) => {
    db.run(
        "DELETE FROM tasks WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // If zero rows were changed, it means the ID does not exist
            if (this.changes === 0) {
                return res.status(404).json({ message: "Task not found" });
            }

            res.json({ message: "Task deleted successfully" });
        }
    );
});

// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
