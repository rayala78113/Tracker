# Tracker Architecture

## Current state

The Tracker is a static browser application deployed by AWS Amplify from GitHub. The entire application is currently contained in `index.html`.

```text
User browser
   |
   | direct HTTPS requests using the Supabase publishable key
   v
Supabase PostgREST
   |
   v
public.tasks
```

The application currently performs task reads, inserts, updates, and deletes directly from browser JavaScript.

## Current capabilities

- Master task list
- Personal to-do view
- Follow-up view
- Ryan assignment queue
- Today/tomorrow pinning
- Task creation and bulk import
- Task editing and deletion
- Completion and undo-completion
- Notes and completion notes
- Browser speech recognition for task and note entry
- Supabase-backed persistence
- AWS Amplify deployment

## Current constraints

- HTML, CSS, JavaScript, database calls, and voice logic are combined in one file.
- No authenticated user identity is enforced by the application.
- User switching is a browser-side display state, not verified identity.
- Database tables have row-level security disabled.
- No audit records are written to `task_history`.
- No server-side or Edge Function layer exists.
- AI and Slack secrets cannot be safely placed in the browser.

## Target architecture

```text
AWS Amplify static frontend
   |
   | authenticated requests
   v
Supabase Auth
   |
   +--------------------+
   |                    |
   v                    v
PostgREST with RLS   Edge Functions
   |                    |
   v                    +--> OpenAI API
Application tables      +--> Slack API/events
   |
   v
Audit history and attachments
```

## Proposed frontend structure

```text
index.html
css/
  styles.css
js/
  config.js
  api.js
  voice.js
  ui.js
  tasks.js
  app.js
supabase/
  functions/
  migrations/
docs/
```

The refactor must preserve existing behavior before new functionality is introduced.

## AI task workflow

1. User opens `Create Task with AI`.
2. User types or dictates rough notes.
3. Frontend sends the notes to an authenticated Supabase Edge Function.
4. The Edge Function calls OpenAI using a server-side secret.
5. OpenAI returns structured task fields.
6. The frontend displays an editable preview.
7. Nothing is saved until the user approves it.
8. The approved task and an audit entry are written to Supabase.

## Deployment model

- `main`: production
- `ai-development`: development and Amplify preview environment
- Changes reach `main` only through a reviewed pull request after browser and database testing.
