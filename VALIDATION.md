# Integration validation — 2026-11-08

Matched repositories: taskflow frontend + Backend NestJS. Work was verified locally against a disposable PostgreSQL 18 cluster. Real user databases and SMTP credentials were not used.

| Check | Result |
| --- | --- |
| Frontend clean npm ci | Passed |
| Frontend production build | Passed; existing bundle-size warning remains |
| Frontend model tests | 2 passed |
| Backend Prisma generation and build | Passed |
| Backend Jest suite | 1 passed |
| HTTP integration suite | Passed: JWT, first-login flag, concurrent login claim, task/project CRUD, invalid fields/dates, cross-account isolation, project deletion preserving tasks, reset tokens, expiry and old JWT invalidation |
| Browser: task board | Passed: add, edit, drag, complete, reopen, delete |
| Browser: registration/projects/detail/table | Passed: validation, project rename, task move, numeric-ID detail, reload, filter/search, mobile and login again |
| Browser: API failure/session expiry | Passed: error displayed, form values retained, stale token removed |
| Browser: theme/mobile | Passed |
| Browser: first-login guide | Passed: automatic first display, skip, reload suppression, manual replay, all steps and separate-browser login suppression |
| Browser: password recovery | Passed using captured test mail and the real backend reset endpoint |
| Upgrade migration with existing rows | Passed: existing account defaults to onboardingPending=false, existing task remains |
| Backend restart | Passed: task and first-login state remain in PostgreSQL |

Six browser scenarios passed. Project and guide scenarios were rerun after the final small UI adjustment and passed. In this verification environment the browser needed a separate launch per scenario; this does not change application behavior. Desktop/mobile screenshots were inspected locally.

Real SMTP delivery still requires the team's SMTP configuration and a live mailbox check. No claim is made that real mail was delivered. SQLite data is not migrated. Changes are intended to be reviewed/applied together with the companion Backend update; main is not changed automatically.
