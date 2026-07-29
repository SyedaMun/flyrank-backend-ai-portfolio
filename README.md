# 🚀 Navigant Education Consultants Task Management REST API

> A continuously evolving RESTful backend application built with **Node.js, Express.js, PostgreSQL, Docker, Docker Compose, and Swagger UI** as part of the **FlyRank Backend AI Engineering Internship (2026)**.

---

# 📖 Project Overview

This repository documents the continuous evolution of a backend application developed throughout the **FlyRank Backend AI Engineering Internship (2026)**.

The project began as a simple RESTful CRUD API and is being enhanced incrementally through weekly backend engineering assignments. Each assignment introduces new technologies, architectural improvements, and engineering practices while building upon the previous implementation.

Instead of creating separate repositories for each assignment, this project demonstrates the complete engineering journey—from a beginner-friendly CRUD API toward a production-oriented backend application.

The application is customized with realistic operational workflows from **Navigant Education Consultants**, illustrating how backend technologies can support education, career development, and AI-powered digital solutions aligned with:

- 🎓 **SDG 4 – Quality Education**
- 👩‍💼 **SDG 5 – Gender Equality**

This repository showcases backend engineering concepts including:

- API development
- CRUD operations
- REST architecture
- OpenAPI / Swagger documentation
- Database integration
- SQL and parameterized queries
- Repository-based database access
- PostgreSQL
- Environment configuration
- Docker containerization
- Docker Compose
- Persistent Docker volumes
- API testing
- Debugging and troubleshooting
- Git and GitHub workflow
- AI-assisted development
- Progressive backend architecture

The repository is intentionally maintained as a **single evolving project** so that the Git history and codebase demonstrate how the application grows over the complete internship.

---

# 🚀 Project Evolution

This repository is maintained as a single, continuously evolving backend engineering project throughout the **FlyRank Backend AI Engineering Internship (2026)**.

Each assignment extends the existing application rather than creating a completely separate project.

| Week | Backend AI Engineering Assignment | Status |
|------|-----------------------------------|--------|
| Week 2 | BE-01 — Build Your First CRUD API | ✅ Completed |
| Week 3 | BE-02 — Connecting CRUD API to the Database | ✅ Completed |
| Week 3 | BE-04 — Containerize Your Stack | ✅ Completed |
| Week 4 | Authentication — Login & Protect | ⏳ Planned |
| Week 5 | Connect to an AI API | ⏳ Planned |
| Week 5 | The Polite Scraper | ⏳ Planned |
| Week 6 | Your First Background Job | ⏳ Planned |
| Week 7 | Build an AI Decision Flow with React Flow + Inngest | ⏳ Planned |
| Week 7 | PDF Report Generator | ⏳ Planned |
| Week 8 | Backend Capstone Documentation & Case Study | ⏳ Planned |

> The internship is a 10-week learning journey. The table above is updated progressively as assignments are completed and the later internship stages are reached.

---

# 🏆 Engineering Skills Progression

Throughout this internship, this repository demonstrates progressive experience with:

- ✅ REST API Design
- ✅ CRUD Operations
- ✅ Express.js
- ✅ OpenAPI / Swagger Documentation
- ✅ Git & GitHub Workflow
- ✅ SQLite Database Integration
- ✅ PostgreSQL Database Integration
- ✅ Parameterized SQL Queries
- ✅ Repository-based Database Access
- ✅ Environment Variables
- ✅ `.env` / `.env.example`
- ✅ Docker
- ✅ Docker Compose
- ✅ Docker Volumes
- ✅ Containerized PostgreSQL
- ✅ Persistent Data Across Container Restarts
- ⏳ Authentication & Authorization
- ⏳ AI API Integration
- ⏳ Web Scraping
- ⏳ Background Jobs
- ⏳ PDF Generation
- ⏳ AI Workflow Orchestration
- ⏳ Production Deployment

---

# ✨ Features

## Current Features

- ✅ RESTful CRUD API
- ✅ Express.js Server
- ✅ JSON Request & Response Handling
- ✅ PostgreSQL Persistent Database Storage
- ✅ PostgreSQL repository module
- ✅ Automatic database table initialization
- ✅ Automatic default data seeding
- ✅ Default data seeded only when the database is empty
- ✅ PostgreSQL parameterized queries
- ✅ `INSERT ... RETURNING`
- ✅ `UPDATE` operations
- ✅ `DELETE` operations
- ✅ 400 validation responses
- ✅ 404 not-found responses
- ✅ 200 successful responses
- ✅ 201 resource-created responses
- ✅ 204 empty-body DELETE response
- ✅ Interactive Swagger UI Documentation
- ✅ Postman API Testing
- ✅ Browser Testing
- ✅ Route Parameters (`:id`)
- ✅ API Debugging & Troubleshooting
- ✅ Git Version Control
- ✅ GitHub Repository Management
- ✅ Dockerized Node.js API
- ✅ Dockerized PostgreSQL
- ✅ Docker Compose
- ✅ Persistent Docker Volume
- ✅ `.env` configuration
- ✅ `.env.example` configuration template
- ✅ One-command application + database startup
- ✅ Persistence verification after container restart
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
| SQLite | Initial persistent database used during the earlier database stage |
| sqlite3 | SQLite Driver used during the earlier database implementation |
| DB Browser for SQLite | SQLite Database Inspection during the earlier stage |
| PostgreSQL | Current relational database |
| `pg` | Node.js PostgreSQL Driver |
| Docker | Containerization |
| Docker Compose | Multi-container application orchestration |
| Docker Volume | Persistent PostgreSQL storage |
| dotenv | Environment variable configuration |

---

# 🗄 Database Evolution

This project demonstrates the evolution of the application's data layer during the FlyRank Backend AI Engineering Internship.

The project first used SQLite as a lightweight local database and was later migrated to PostgreSQL to support a more realistic backend architecture and Dockerized development environment.

---

## Phase 1 — SQLite

SQLite was used during the initial database integration stage because it is lightweight, serverless, and easy to use for local backend development.

The SQLite implementation demonstrated:

- Persistent relational data storage
- Automatic database creation
- Automatic table creation
- Default task seeding
- SQL queries
- Parameterized queries
- CRUD operations
- Database persistence across application restarts

The earlier SQLite database was stored locally as:

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
flyrank-crud-api/
│
├── .gitignore
├── .env.example
├── README.md
├── Dockerfile
├── compose.yaml
├── server.js
├── database.js
├── openapi.json
├── package.json
└── package-lock.json
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

## Prerequisites

Make sure the following are installed:

- Node.js
- Docker Desktop
- Git

## Clone Repository

```bash
git clone https://github.com/SyedaMun/flyrank-crud-api.git
cd flyrank-crud-api
```

## Install Dependencies

```bash
npm install
```

This installs the dependencies listed in `package.json` and prepares the project for development and local execution.

## Configure Environment Variables

Create a local `.env` file containing the PostgreSQL connection string required by the application.

The repository includes `.env.example` as a safe configuration template.

> **Security:** `.env` is intentionally excluded from Git through `.gitignore`. Never commit real database credentials or secrets.

## Start the Full Stack

The current application is containerized with Docker Compose.

Start both the API and PostgreSQL database with:

```bash
docker compose up
```

Docker Compose starts:

- Node.js / Express API
- PostgreSQL database
- Persistent PostgreSQL Docker volume

## API

Once the containers are running:

```text
http://localhost:3000/tasks
```

## Swagger Documentation

Interactive API documentation:

```text
http://localhost:3000/docs
```

## Stop the Stack

To stop the application and database containers:

```bash
docker compose down
```

> The PostgreSQL data is stored in a Docker volume, so stopping the containers does not remove the persisted database data.

## Persistence Verification

Database persistence was verified by:

1. Creating task records.
2. Running the application and PostgreSQL through Docker Compose.
3. Stopping the stack.
4. Starting the stack again.
5. Confirming that previously created task records remained available.

This demonstrates that PostgreSQL data survives application and container restarts.

---

# 🧪 Testing

The API was tested throughout development using multiple tools and environments.

## API Testing

The CRUD endpoints were tested using:

- ✅ Postman
- ✅ Swagger UI (`Try it out`)
- ✅ Browser testing for GET requests
- ✅ Dockerized API environment

## CRUD Verification

The following responses were verified:

| Operation | Expected Result |
|---|---|
| GET `/tasks` | `200 OK` |
| GET `/tasks/:id` | `200 OK` |
| GET unknown task | `404 Not Found` |
| POST `/tasks` | `201 Created` |
| POST without title | `400 Bad Request` |
| PUT `/tasks/:id` | `200 OK` |
| PUT unknown task | `404 Not Found` |
| DELETE `/tasks/:id` | `204 No Content` |
| DELETE unknown task | `404 Not Found` |

## PostgreSQL Persistence Testing

Persistence was verified using the Dockerized PostgreSQL database.

A task was created, the application and database containers were stopped and restarted, and the previously stored data was confirmed to remain available.

This verified that the PostgreSQL Docker volume was working correctly.

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