# Navigant Education Consultants Task Management REST API

## Project Overview

This project is a RESTful CRUD API developed using **Node.js** and **Express.js** as part of the **FlyRank Backend AI Engineering Internship (Week 2 – Assignment 1)**.

Rather than using generic sample data, the API was customized with realistic operational tasks from **Navigant Education Consultants**, demonstrating practical backend development skills through education, career development, and AI empowerment workflows aligned with:

- SDG 4 – Quality Education
- SDG 5 – Gender Equality

The project also includes professional API documentation using **OpenAPI (Swagger UI)** for interactive endpoint testing.

---

## Features

- RESTful CRUD API
- Express.js backend server
- JSON request and response handling
- In-memory task management
- Interactive Swagger UI documentation
- Browser testing
- Postman API testing
- Route parameter handling
- Basic backend debugging and troubleshooting
- Real-world business sample data

---

## Technologies Used

- Node.js
- Express.js
- JavaScript
- REST API
- JSON
- Swagger UI
- OpenAPI 3.0
- Postman
- Git
- GitHub
- Visual Studio Code

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all tasks |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/docs` | Interactive Swagger UI documentation |

---

## Project Structure

```
flyrank-crud-api
│
├── server.js
├── package.json
├── package-lock.json
├── openapi.json
└── README.md
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/SyedaMun/flyrank-crud-api.git
```

### Install dependencies

```bash
npm install
```

### Start the server

```bash
node server.js
```

The application will run at:

```
http://localhost:3000/tasks
```

Swagger documentation is available at:

```
http://localhost:3000/docs
```

---

## Testing

The API was successfully tested using:

- Browser
- Postman
- Swagger UI ("Try it out")

All CRUD endpoints were verified successfully.

---

## Learning Outcomes

This project strengthened practical knowledge of:

- Backend application setup
- Express.js fundamentals
- REST API development
- CRUD operations
- Route parameters
- JSON request handling
- API testing
- Debugging techniques
- OpenAPI documentation
- Git version control
- GitHub repository management

---

## Future Improvements

Future versions of this project will include:

- Layered Architecture
- SQLite Database Integration
- PostgreSQL Database
- Docker Containerization
- Authentication & Authorization
- Persistent Data Storage
- Production Deployment

---

## Author

**Syeda Munazza Bukhari**

Founder — Navigant Education Consultants

FlyRank Backend AI Engineering Intern (2026)

GitHub:
https://github.com/SyedaMun