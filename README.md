# SAP Task Planner (Full Stack Demo)

This project delivers a **SAP-grade task planning experience** with a Fiori-inspired front-end, an Express + TypeScript backend, and a lightweight SQLite database. It is designed to run locally for workshops and GitHub Copilot code review demonstrations.

## ✨ Features

- **Fiori-inspired UI** with responsive layout, interactive dashboard, and toast notifications.
- **RESTful API** built with Express, TypeScript, and structured controllers/repositories.
- **SQLite persistence** via `better-sqlite3`, including migrations and seed data.
- **Secure defaults** provided by Helmet, CORS, and input validation.
- **Production-ready tooling**: ESLint, Prettier, Jest, and TypeScript build pipeline.

## 🧱 Project Structure

```
├── public/                 # SAP Fiori styled front-end assets
├── src/
│   ├── config/             # Database connection, migration, and seed scripts
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Error handling and shared middleware
│   ├── models/             # TypeScript models and DTOs
│   ├── repositories/       # Data access layer
│   ├── routes/             # Express routers
│   ├── __tests__/          # Jest + Supertest integration tests
│   └── server.ts           # Express app entry point
├── data/                   # SQLite database file (auto-generated)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run database migrations and seed data (optional but recommended)

```bash
npm run db:migrate
npm run db:seed
```

### 3. Start the development server with hot reload

```bash
npm run dev
```

The application will be available at `http://localhost:4000`. The UI is served from Express, and all API routes live under `/api/tasks`.

### 4. Build for production

```bash
npm run build
```

### 5. Launch the compiled server

```bash
npm start
```

## 🧪 Testing & Linting

Run Jest integration tests (uses Supertest against the Express app):

```bash
npm test
```

Static analysis and formatting:

```bash
npm run lint
npm run lint:fix
```

## 🔌 REST API Overview

| Method | Route         | Description              |
| ------ | ------------- | ------------------------ |
| GET    | `/api/tasks`  | Fetch all tasks          |
| GET    | `/api/tasks/:id` | Get a specific task  |
| POST   | `/api/tasks`  | Create a new task        |
| PUT    | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Remove a task         |

All payloads accept JSON bodies. See `src/models/task.ts` for the full DTO definition.

## 🛡️ SAP-grade Considerations

- **Security**: Helmet for HTTP hardening, CORS configured, request validation, and sanitized inputs.
- **Resilience**: Synchronous database layer for predictable local demos, migrations to keep schema up to date.
- **Observability**: HTTP request logging via Morgan and health check endpoint at `/health`.
- **Extensibility**: Clear separation of concerns—controllers, repositories, and models.

## 🧰 Useful Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start Express with hot reloading (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled JavaScript server |
| `npm run db:migrate` | Execute SQLite migrations |
| `npm run db:seed` | Populate sample data |
| `npm test` | Run Jest + Supertest integration tests |
| `npm run lint` | Lint all TypeScript sources |

## 🙌 Credits

This demo was crafted to help showcase GitHub Copilot code review workflows in an enterprise-ready SAP context. Feel free to extend it with authentication, multi-tenant features, or a full UI5 front-end if you need a more advanced scenario.
