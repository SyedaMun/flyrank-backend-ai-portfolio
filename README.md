# 🚀 Navigant Education Consultants Task Management REST API

> A RESTful CRUD API built with **Node.js**, **Express.js**, and **Swagger UI** as part of the **FlyRank Backend AI Engineering Internship (2026)**.

---

# 📖 Project Overview


This repository documents the continuous evolution of a backend application developed throughout the **FlyRank Backend AI Engineering Internship (2026)**.

The project began as a simple RESTful CRUD API and is being enhanced incrementally through weekly backend engineering assignments. Each assignment introduces new technologies, architectural improvements, and engineering practices while building upon the previous implementation.

Instead of creating separate repositories for each assignment, this project demonstrates the complete engineering journey—from a beginner-friendly CRUD API to a production-oriented backend application.

The application is customized with realistic operational workflows from **Navigant Education Consultants**, illustrating how backend technologies can support education, career development, and AI-powered digital solutions aligned with:

- 🎓 **SDG 4 – Quality Education**
- 👩‍💼 **SDG 5 – Gender Equality**

This repository showcases backend engineering concepts including API development, database integration, containerization, testing, documentation, version control, and modern software engineering practices.

---

# 🚀 Project Evolution

This repository is maintained as a single, continuously evolving backend engineering project throughout the **FlyRank Backend AI Engineering Internship (2026)**. Each weekly assignment extends the existing application with new technologies and engineering practices, demonstrating progressive backend development skills.

| Week | Backend AI Engineering Assignment | Status |
|------|-----------------------------------|--------|
| Week 2 | BE-01 — Build Your First CRUD API | ✅ Completed |
| Week 3 | BE-02 — Connect CRUD API to SQLite | ✅ Completed |
| Week 3 | BE-04 — Containerize Your Stack | 🔄 In Progress |
| Week 4 | Authentication — Login & Protect | ⏳ Planned |
| Week 5 | Connect to an AI API | ⏳ Planned |
| Week 5 | The Polite Scraper | ⏳ Planned |
| Week 6 | Your First Background Job | ⏳ Planned |
| Week 7 | Build an AI Decision Flow with React Flow + Inngest | ⏳ Planned |
| Week 7 | PDF Report Generator | ⏳ Planned |
| Week 8 | Backend Capstone Documentation & Case Study | ⏳ Planned |

---

# 🏆 Engineering Skills Progression

Throughout this internship, this repository demonstrates practical experience with:

- ✅ REST API Design
- ✅ CRUD Operations
- ✅ Express.js
- ✅ OpenAPI / Swagger Documentation
- ✅ Git & GitHub Workflow
- ✅ SQLite Database Integration
- 🔄 Docker & Containerization
- ⏳ Authentication & Authorization
- ⏳ AI API Integration
- ⏳ Web Scraping
- ⏳ Background Jobs
- ⏳ PDF Generation
- ⏳ AI Workflow Orchestration
- ⏳ Production Deployment

---

# ✨ Features

- ✅ RESTful CRUD API
- ✅ Express.js Server
- ✅ JSON Request & Response Handling
- ✅ SQLite Persistent Database Storage
- ✅ Automatic Database Initialization
- ✅ Automatic Table Creation
- ✅ Automatic Default Data Seeding
- ✅ Parameterized SQL Queries
- ✅ Interactive Swagger UI Documentation
- ✅ Browser Testing
- ✅ Postman API Testing
- ✅ Route Parameters (`:id`)
- ✅ API Debugging & Troubleshooting
- ✅ Git Version Control
- ✅ GitHub Repository Management
- ✅ Real-world Educational Workflow Sample Data

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript Runtime |
| Express.js | Backend Framework |
| JavaScript | Programming Language |
| REST API | API Architecture |
| JSON | Data Exchange |
| Swagger UI | Interactive API Documentation |
| OpenAPI 3.0 | API Specification |
| Postman | API Testing |
| Git | Version Control |
| GitHub | Source Code Repository |
| VS Code | Development Environment |
| SQLite | Persistent Embedded Database |
| sqlite3 | SQLite Driver for Node.js |
| DB Browser for SQLite | Database Inspection & SQL Execution |

# 🗄 SQLite Database

## Why SQLite?

SQLite was selected because it is a lightweight, serverless relational database that is ideal for beginner backend applications. It stores data in a single local database file while supporting standard SQL queries and persistent data storage.

## Database Location

The SQLite database file is stored in the project root:

```text
flyrank-crud-api/
└── tasks.db
```

## Automatic Initialization

When the application starts:

- The database file is created automatically if it does not exist.
- The `tasks` table is created automatically if it does not exist.
- Three default sample tasks are inserted only when the table is empty.
---

# 📂 Project Structure

```text
flyrank-crud-api
│
├── .gitignore
├── README.md
├── server.js
├── database.js
├── tasks.db
├── package.json
├── package-lock.json
└── openapi.json
```

---

# 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all tasks |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/docs` | Interactive Swagger UI Documentation |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/SyedaMun/flyrank-crud-api.git
```

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
node server.js
```
> **Note:** On the first startup, the application automatically creates the `tasks.db` SQLite database, creates the `tasks` table if it does not exist, and seeds three default sample tasks when the database is empty.
Server:

```
http://localhost:3000/tasks
```

Swagger Documentation:

```
http://localhost:3000/docs
```

---

# 🧪 Testing

The project was successfully tested using:

- ✅ Browser Testing
- ✅ Postman
- ✅ Swagger UI ("Try it out")

All CRUD endpoints were verified successfully.

---

# 🎯 Learning Outcomes

Through this project, I gained practical experience with:

- Backend application setup
- Express.js fundamentals
- REST API development
- CRUD operations
- Route parameters
- JSON request handling
- API debugging
- OpenAPI / Swagger documentation
- Git version control
- GitHub workflow
- Professional repository management

---

# 🧪 Example SQL Query

During development, the following SQL query was executed manually using **DB Browser for SQLite** to inspect the database:

```sql
SELECT * FROM tasks;
```

This query displays every record stored in the `tasks` table and was used to verify database persistence throughout the project.

# 📸 Database Screenshot

The SQLite database was inspected and tested using **DB Browser for SQLite** during development.

Example:

![SQLite Database](images/database-browser.png)

> Replace the image path with your uploaded database screenshot after adding it to the repository.

# 👩‍💻 Author

**Syeda Munazza Bukhari**

Founder — Navigant Education Consultants

Backend AI Engineering Intern — FlyRank AI Internship (2026)

Building practical AI and backend solutions that support education, career development, and digital empowerment.

GitHub:
https://github.com/SyedaMun

---

# 🙏 Acknowledgements

Developed as part of the **FlyRank Backend AI Engineering Internship (2026)** to strengthen practical backend engineering skills through hands-on project development.