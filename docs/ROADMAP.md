# Tracker Delivery Roadmap

## Stage 0 — Baseline

Status: in progress

- Preserve `main` as production.
- Use `ai-development` for all changes.
- Connect `ai-development` to an AWS Amplify preview deployment.
- Document the current architecture, security risks, and release process.
- Record a baseline count of production tasks and verify basic CRUD behavior.

Exit criteria:

- Development URL works independently of production.
- Existing tasks load correctly.
- Add, edit, complete, reopen, assign, pin, and delete are tested on the development deployment.

## Stage 1 — Code separation

- Move CSS from `index.html` to `css/styles.css`.
- Move database calls to `js/api.js`.
- Move voice recognition to `js/voice.js`.
- Move task behavior to `js/tasks.js`.
- Move rendering and modal behavior to `js/ui.js`.
- Keep `js/app.js` as the application entrypoint.

Exit criteria:

- No visual or functional regression.
- Browser console contains no application errors.
- Development deployment passes the Stage 0 CRUD checks.

## Stage 2 — Authentication and audit

- Add Supabase Auth.
- Add authorized team membership.
- Add audit-writing functions or triggers.
- Replace permanent task deletion with soft deletion.
- Enable and test RLS policies.

Exit criteria:

- Unauthenticated users cannot read or modify task data.
- Authorized users retain required functionality.
- Material changes create audit records.

## Stage 3 — AI task drafting

- Deploy authenticated `ai-task-parser` Edge Function.
- Store the OpenAI key as an Edge Function secret.
- Add `Create Task with AI` modal.
- Return structured fields: title, section, priority, owner, due date, notes, next action, and tags.
- Require user review and approval before insert.

Exit criteria:

- Rough text and dictated notes produce a useful editable draft.
- No model response is saved without approval.
- AI-assisted creation is recorded in history.

## Stage 4 — AI task intelligence

- Add controlled task search tools.
- Support questions about overdue, blocked, assigned, facility, vendor, and follow-up work.
- Generate daily and weekly summaries.
- Draft requisitions, vendor emails, and management updates from selected tasks.

## Stage 5 — Slack ingestion

- Define approved Slack channels and event types.
- Parse messages into proposed task updates.
- Link Slack source messages to tasks.
- Require confirmation for uncertain matches or completion decisions.
- Add commitment and overdue-follow-up detection.

## Release process

1. Implement on `ai-development`.
2. Deploy through the Amplify development branch.
3. Run the applicable exit-criteria tests.
4. Open a pull request into `main`.
5. Review the diff and database impact.
6. Merge and verify the production deployment.
