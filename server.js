const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapiSpecification = require("./openapi.json");
const supabase = require("./supabase");

const app = express();
const db = require("./database");

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// ==========================================
// REUSABLE AUTHENTICATION MIDDLEWARE (STAGE 4)
// ==========================================
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: "Invalid or expired token"
            });
        }

        // Attach user metadata onto the request object so downstream routes can see who it is
        req.user = user;
        
        // Pass control safely to the next route function
        next();

    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};

// ==========================================
// STAGE 1: AUTHENTICATION — SIGN UP
// ==========================================

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(201).json({
            user: data.user
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                message: error.message
            });
        }

        return res.status(200).json({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// POST /auth/logout (STAGE 4 REQUIREMENT)
app.post("/auth/logout", authenticateUser, async (req, res) => {
    try {
        // Sign out user session globally on Supabase cloud servers
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Successful logouts send an HTTP 204 No Content back
        return res.status(204).send();

    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ==========================================
// STAGE 2: PUBLIC GATEWAY
// ==========================================

// GET /public/info
app.get("/public/info", (req, res) => {
    return res.status(200).json({
        message: "Welcome stranger! This info is public."
    });
});

// ==========================================
// STAGE 3 & 4: PROTECTED CHANNELS (NOW ROUTED VIA MIDDLEWARE)
// ==========================================

// GET /protected/profile
app.get("/protected/profile", authenticateUser, (req, res) => {
    // Because the middleware executes first, we can instantly access req.user safely!
    return res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at
    });
});

// GET /protected/dashboard (STAGE 4 REQUIREMENT)
app.get("/protected/dashboard", authenticateUser, (req, res) => {
    return res.status(200).json({
        message: `Welcome to your security dashboard, user ${req.user.email}!`,
        status: "Active metrics rendering perfectly."
    });
});

// ==========================================
// SWAGGER API DOCUMENTATION
// ==========================================

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// ==========================================
// AI ENGINE INTEGRATION: STAGE 1 ROUTING
// ==========================================
const ticketRoutes = require("./src/llm/routes/ticketRoutes");
app.use(ticketRoutes);

// ==========================================
// STAGE 2: READ ENDPOINTS (KEEP PUBLIC)
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
// STAGE 3: CREATE TASK (PROTECTED FOR SECURITY)
// ==========================================

// POST /tasks
app.post("/tasks", authenticateUser, async (req, res) => {

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
// STAGE 3: UPDATE TASK (PROTECTED FOR SECURITY)
// ==========================================

// PUT /tasks/:id
app.put("/tasks/:id", authenticateUser, async (req, res) => {

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
// STAGE 3: DELETE TASK (PROTECTED FOR SECURITY)
// ==========================================

// DELETE /tasks/:id
app.delete("/tasks/:id", authenticateUser, async (req, res) => {

    try {
        const task = await db.deleteTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

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
