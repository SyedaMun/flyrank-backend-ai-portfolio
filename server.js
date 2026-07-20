const express = require("express");
const app = express();

// 🟢 NEW LINES: Load Swagger Tools
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

// Universal language translator middleware
app.use(express.json());

const PORT = 3000;

// Navigant Education Consultants - Real-World Database Array
let tasks = [
    {
        id: 1,
        title: "Review and optimize student resume templates for upcoming career workshop",
        category: "SDG 4 - Quality Education",
        completed: true
    },
    {
        id: 2,
        title: "Conduct AI tool empowerment seminar for female community leaders",
        category: "SDG 5 - Gender Equality",
        completed: false
    },
    {
        id: 3,
        title: "Draft custom cover letter guides for digital literacy trainees",
        category: "SDG 4 - Quality Education",
        completed: false
    }
];

// 🟢 NEW LINE: Serve the Swagger UI documentation page
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 📥 GET Endpoint
app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// 📤 POST Endpoint
app.post("/tasks", (req, res) => {
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        category: req.body.category || "General Consulting",
        completed: false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// ✂️ DELETE Endpoint
app.delete("/tasks/:id", (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id == req.params.id);
    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }
    tasks.splice(taskIndex, 1);
    res.json({ message: "Task deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📑 View Interactive Documentation at http://localhost:3000/docs`);
});
