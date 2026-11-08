# Taskflow frontend

React + Redux Toolkit + React Bootstrap. This app calls the team's separate NestJS backend in [FER202ToDoList/Backend](https://github.com/FER202ToDoList/Backend), backed by PostgreSQL. There is no bundled Express/SQLite server and no demo account or seeded demo workspace.

## Run on Windows

Place `Backend` and `taskflow` beside each other. Use a Node version supported by both projects (Node 24+).

### Terminal 1: Backend

```powershell
cd Backend
npm ci
# Only if .env does not exist:
Copy-Item .env.example .env
```

Edit the backend `.env`: set `DATABASE_URL`, a long random `JWT_SECRET`, and `ALLOWED_URLS=http://localhost:5173,http://127.0.0.1:5173`. Use the connection values in the Docker Compose file if using its database. Never overwrite an existing database configuration blindly.

```powershell
docker compose -f docker/docker-compose.yml up -d
npm run prisma:generate
npm run db:migrate
npm run start:dev
```

### Terminal 2: Frontend

```powershell
cd taskflow
npm ci
npm run dev
```

Open http://localhost:5173, register your own account and log in. Registration is followed by an API login automatically. Both repositories' integration updates must be applied together before using project editing and the first-login guide.

The frontend `.env` already contains:

```env
VITE_API_URL=http://localhost:3000
```

Restart Vite after editing it. Do not append `/api`: that path is Swagger, not a business-API prefix. `npm run dev` and `npm run dev:client` start only the frontend; start NestJS separately. No MockAPI.io configuration is needed.

## Features

- Registration, login/JWT, account menu and logout.
- Task CRUD, detail URL, complete/reopen, priority P1–P4, due date and project assignment.
- Board: Today (including overdue), Upcoming, No date and Done. Desktop drag/drop updates dates/completion. On mobile, use the task editor and completion button.
- Projects: create, rename, recolour and delete. Deleting a project keeps its tasks in Inbox.
- All tasks, Today, Inbox, Upcoming, Completed, search/filter/sort and summary counts.
- Light/dark mode and responsive layouts.
- Forgot/reset password pages. SMTP must be configured in the backend to deliver real mail. Reset links use `/reset-password?token=...`.
- A six-step usage guide opens only on the first successful login of a newly registered account. The backend atomically consumes eligibility, so reloads, later logins and other devices do not auto-open it. Existing accounts are excluded by the migration default. Closing/skipping does not reset eligibility. The account menu can replay the guide manually. No demo tasks are created.

## Frontend/backend contract

`src/api.js` reads the URL and adds the stored bearer token. `src/api-models.js` translates the NestJS contract into the existing UI model; `src/store.js` owns asynchronous API operations and Redux state.

| UI model | Backend |
| --- | --- |
| name | fullName |
| completed | isCompleted |
| due_date (empty string allowed in UI) | dueDate (null when empty) |
| project_id | projectId |
| created_at | createdAt |
| task id as string | task id as integer |

Project IDs stay UUID strings. PATCH sends only changed/selected fields. Login returns `{token, showOnboarding}`; the frontend fetches `/auth/me` with that new token before entering the workspace. API error arrays are displayed as readable text.

## Verification

```powershell
npm test
npm run build
```

For full API/browser checks against an isolated PostgreSQL schema, first build the backend and start its **test-only** server in a separate terminal:

```powershell
cd Backend
npm run prisma:generate
npm run build
# Configure TEST_DATABASE_URL or DATABASE_URL to a disposable test database first.
node test/start-test-server.cjs
```

The test entrypoint migrates schema `taskflow_e2e`, listens on 3101, captures reset mail and disables throttling. Never use it for production. Tests create their own accounts; real SMTP is not needed.

```powershell
cd taskflow
npm run test:api
npx playwright install chromium
npm run test:e2e
```

The browser test runner starts Vite itself. Keep frontend port 5173 free. `TEST_API_URL` can override the API-test target; the bundled browser reset-mail test expects the default test server on 3101.

SQLite accounts/tasks are not migrated into PostgreSQL. Old SQLite files on your machine are not deleted, but this app no longer reads them. A copied stale SQLite JWT may require a fresh login.
