const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "tasks.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Database connection failure:", err.message);
    } else {
        console.log("🏁 Connected successfully to local persistent tasks.db");
        initializeDatabase();
    }
});

function initializeDatabase() {

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER DEFAULT 0
        )
    `, (err) => {

        if (err) {
            console.error("❌ Table creation failed:", err.message);
            return;
        }

        seedDefaultTasks();
    });

}

function seedDefaultTasks() {

    db.get("SELECT COUNT(*) AS count FROM tasks", [], (err, row) => {

        if (err) {
            console.error("❌ Count query failed:", err.message);
            return;
        }

        if (row.count > 0) {
            console.log("✅ Existing data found. Skipping seed.");
            return;
        }

        console.log("🌱 Seeding default Navigant project tasks...");

        const stmt = db.prepare(
            "INSERT INTO tasks (title, done) VALUES (?, ?)"
        );

        stmt.run("Prepare SDG 4 education workshop materials", 0);
        stmt.run("Schedule meeting with women mentors for the LeadHer initiative", 0);
        stmt.run("Publish Navigant Education Consultants website update", 1);

        stmt.finalize((err) => {
            if (err) {
                console.error("❌ Seed failed:", err.message);
            } else {
                console.log("✅ Three default tasks seeded successfully!");
            }
        });

    });

}

module.exports = db;