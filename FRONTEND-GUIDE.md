# Reading the frontend

1. `src/main.jsx`: mounts React, Redux Provider and BrowserRouter.
2. `src/api.js`: Axios instance, base URL from `.env`, bearer token and 401 handling.
3. `src/api-models.js`: maps NestJS task fields to the UI model and normalizes numeric task IDs to strings for URLs/drag-drop.
4. `src/store.js`: login/register, profile fetch, tasks/projects thunks, data and UI slices.
5. `src/App.jsx`: routes and protected workspace; password recovery routes are public so links from email work while signed in or out.
6. `src/pages/Auth.jsx`: Formik registration/login. Registration calls the backend, then logs in with the submitted credentials. No demo-account flow.
7. `src/pages/Workspace.jsx`: loads data, manages editor/confirmation dialogs and notifications, and opens the first-login guide.
8. `src/pages/BoardPage.jsx`, `TaskPage.jsx`, `TaskDetail.jsx`: board/list/detail. Search/filter/counts run over the current account's task list in React.
9. `src/components/TaskEditor.jsx`, `ProjectEditor.jsx`: validated forms calling Redux thunks.
10. `src/pages/PasswordRecovery.jsx`: request reset mail and submit a reset token/new password.
11. `src/components/UsageGuide.jsx`: six-step guide with highlighted areas, Back/Next/Skip/Finish and manual replay from the account menu.

The backend lives in the separate `Backend` repository. Follow README.md for setup and validation. No MockAPI.io or frontend database is used. The server checks ownership; route guards in the frontend are not a substitute for backend authorization.
