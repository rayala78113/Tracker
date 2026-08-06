# TSAR Task Tracker

TSAR Task Tracker is a lightweight operations task-management application deployed through AWS Amplify and backed by Supabase.

## Environments

- `main`: production branch. Changes should reach this branch only through a reviewed pull request.
- `ai-development`: development and testing branch for security, architecture, and AI work.

## Current architecture

```text
Browser
  |
  | HTTPS REST requests
  v
Supabase PostgREST API
  |
  v
public.tasks

GitHub main branch
  |
  v
AWS Amplify production deployment
```

The current application is implemented in a single `index.html` file containing HTML, CSS, JavaScript, voice-entry logic, and direct Supabase REST calls.

## Current database

The connected Supabase project is `jbnufforfpgawnawgujv` and currently contains these application tables:

- `tasks`
- `task_history`
- `task_attachments`
- `recurring_tasks`

At the start of the architecture review, `tasks` contained 217 records. The other three application tables contained no records.

## Development rules

1. Do not develop directly on `main`.
2. Do not place OpenAI, Slack, Supabase service-role, or other private keys in browser code or GitHub.
3. Test all database-policy changes before merging them to production.
4. Keep AI-generated task changes in preview/approval mode until audit history and authorization are operational.
5. Use pull requests to merge `ai-development` changes into `main`.

## Planned delivery order

1. Document and stabilize the existing application.
2. Add authentication and row-level security without interrupting current task access.
3. Activate task audit history.
4. Add a secured Supabase Edge Function for AI task parsing.
5. Add a `Create Task with AI` preview-and-approve workflow.
6. Add controlled AI queries and task updates.
7. Add Slack event ingestion after authorization and audit controls are proven.

See `docs/ARCHITECTURE.md`, `docs/SECURITY-PLAN.md`, and `docs/ROADMAP.md` for the implementation plan.
