# Student Management Portal

Self-hosted student management system (React + Vite frontend, Express + SQLite backend) using only free/open-source components, packable into a single standalone executable via Node SEA.

**Stack / conventions:**
- Node.js >= 22.13 required (`node:sqlite`, Single Executable Applications).
- Backend handlers keep the Lambda-style signature `handler(event) -> { statusCode, headers, body }`; `backend/server/app.js` adapts Express requests to events, `backend/server/routes.js` is the route table.
- Shared modules live in `backend/common/` (config, db, users, authMiddleware, storage, queue, mailer, logger). Use `requireRole(...)`/`withAuth(...)`, `parseBody`, `fromError` in handlers.
- Frontend calls the API at same-origin `/api` (Vite dev server proxies to :8080).
- All runtime state is under `DATA_DIR` (default `./data`; next to the executable in packaged builds).
- Tests: `npm test` (end-to-end integration test). Packaging: `npm run build:exe`.
- UI text and code comments are in Vietnamese; keep that convention.
