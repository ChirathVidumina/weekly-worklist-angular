# Cadence — Enterprise Weekly Work List Planner

A production-grade weekly sprint and work-list planner inspired by Linear and Notion.

## Architecture

- **Frontend (`src/`):** Angular 22 (Standalone Components, Signals, Reactive Form Modals, Tailwind CSS v4, CDK Drag & Drop).
- **Backend (`WeeklyWorklist.Api/`):** ASP.NET Core 8 Web API, C# 12, `MongoDB.Driver` 2.30, Swagger/OpenAPI.
- **Database:** MongoDB Atlas Cloud Database (`weekly_worklist_db`).
- **Cloud Deployment:** Vercel (Angular SPA) + Render (ASP.NET Core 8 multi-stage Docker container).

---

## Getting Started

### 1. Run ASP.NET Core 8 Backend

Ensure .NET 8 SDK is installed:

```bash
cd WeeklyWorklist.Api
dotnet run
```

- REST API Root: `http://localhost:8080/`
- API Endpoints: `http://localhost:8080/api/v1/tasks`, `http://localhost:8080/api/v1/categories`
- Interactive OpenAPI / Swagger UI: `http://localhost:8080/swagger`

### 2. Run Angular Frontend

```bash
npm install
npm start
```

Navigate to `http://localhost:4200/`.

---

## Testing & Quality Assurance

### Run Unit Tests
```bash
npm test
```

### Build Production Artifacts
```bash
# Frontend
npm run build

# Backend
cd WeeklyWorklist.Api && dotnet build -c Release
```
