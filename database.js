const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                done INTEGER DEFAULT 0
            )
        `);

        console.log("✅ PostgreSQL tasks table ready.");

        await seedDefaultTasks();

    } catch (err) {
        console.error("❌ Database initialization failed:", err.message);
    }
}

// ==========================================
// SEED DEFAULT TASKS
// ==========================================

async function seedDefaultTasks() {
    try {
        const result = await pool.query(
            "SELECT COUNT(*) AS count FROM tasks"
        );

        const taskCount = Number(result.rows[0].count);

        if (taskCount > 0) {
            console.log("✅ Existing data found. Skipping seed.");
            return;
        }

        console.log("🌱 Seeding default Navigant project tasks...");

        await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2)",
            ["Prepare SDG 4 education workshop materials", 0]
        );

        await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2)",
            ["Schedule meeting with women mentors for the LeadHer initiative", 0]
        );

        await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2)",
            ["Publish Navigant Education Consultants website update", 1]
        );

        console.log("✅ Three default tasks seeded successfully!");

    } catch (err) {
        console.error("❌ Seed failed:", err.message);
    }
}

// ==========================================
// STAGE 2: READ OPERATIONS
// ==========================================

// Get all tasks
async function getAllTasks() {
    const result = await pool.query(
        "SELECT * FROM tasks"
    );

    return result.rows;
}

// Get one task by ID
async function getTaskById(id) {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

// ==========================================
// START DATABASE INITIALIZATION
// ==========================================

initializeDatabase();

// ==========================================
// EXPORT DATABASE MODULE
// ==========================================

module.exports = {
    pool,
    getAllTasks,
    getTaskById
};