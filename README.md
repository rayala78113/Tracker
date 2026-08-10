# TSAR Task Tracker

TSAR Task Tracker is a lightweight operations task-management application deployed through AWS Amplify and backed by Supabase.

## Environments

- `main`: production branch. Changes should reach this branch only after development testing.
- `ai-development`: development and testing branch for security, architecture, and AI work.

## Target architecture

```text
ChatGPT / Tracker UI / Slack
            |
            v
     Tracker command layer
            |
     targeted task search
            |
            v
        Supabase
            |
   tasks + task history
```

Supabase remains the source of truth. The Tracker website is the visual operations interface; AI interfaces are alternate ways to query and direct the same underlying work.

## AI command layer

`supabase/functions/tracker-command/index.ts` is the unified AI entry point for normal Tracker operations. It supports:

- questions and workload analysis
- planning and prioritization
- new-task proposals
- task updates
- note appends
- assignment changes
- follow-up/status/priority/due-date changes
- completion requests

Writes remain preview-and-confirm. The command layer searches/filter tasks before sending records to the model instead of loading the entire Tracker for routine requests.

`public.search_tracker_tasks(...)` provides targeted database retrieval by text, assignee, section, completion state, follow-up state, priority, and due-date range.

## Development UI

`tracker-ai.html` wraps the existing Tracker and opens `ai-command-center.html` in a side panel. The panel uses one natural-language input for questions, planning, creation, and updates.

The earlier `ai-assistant.html` and `ai-tracker-chat.html` pages are retained only as development prototypes and should not be treated as the long-term architecture.

## Current database

The connected Supabase project is `jbnufforfpgawnawgujv` and contains these application tables:

- `tasks`
- `task_history`
- `task_attachments`
- `recurring_tasks`

Slack support also uses `slack_tracker_pending_actions` for short-lived confirmation requests.

## Development rules

1. Do not develop directly on `main`.
2. Do not place OpenAI, Slack signing secrets, Slack bot tokens, Supabase service-role keys, or other private credentials in browser code or GitHub.
3. Keep Supabase as the system of record.
4. Retrieve the smallest useful task set before AI reasoning.
5. Do not let AI invent work, status, assignees, dates, or completion.
6. Require confirmation for browser/Slack writes and stop on ambiguous task matches.
7. Preserve audit history for task changes.
8. Resolve authentication/RLS before treating the browser as production-secure.

## Remaining production work

1. Test the unified command layer against real questions, create requests, updates, and completion commands.
2. Replace/retire prototype AI paths after validation.
3. Add user authentication and restrictive row-level security; the current public application tables still require this hardening.
4. Review the `ai-development` diff and merge the production-ready pieces into `main`.
