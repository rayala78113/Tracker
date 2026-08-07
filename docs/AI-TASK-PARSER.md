# AI Task Parser

## Purpose

`supabase/functions/ai-task-parser/index.ts` is the first AI capability for Tracker.

It accepts rough notes and returns a structured task draft. It intentionally does not insert or update a task. The user must review and approve the draft in the Tracker UI before it is saved.

## Request

```json
{
  "notes": "USA DeBusk needs to replace Block Valve 3..."
}
```

## Response

```json
{
  "draft": {
    "title": "Replace Block Valve 3",
    "section": "Maintenance",
    "notes": "...",
    "assigned_to": "",
    "followup": false,
    "rationale": "..."
  }
}
```

## Required secret

Configure this only in Supabase Edge Function secrets:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_MODEL` (defaults to `gpt-5-mini`)

Never add the OpenAI API key to `index.html`, GitHub, or browser-side JavaScript.

## Deployment sequence

1. Configure `OPENAI_API_KEY` in Supabase.
2. Deploy the `ai-task-parser` Edge Function.
3. Test the function directly with sample rough notes.
4. Add the Tracker AI draft modal on `ai-development`.
5. Save to `tasks` only after explicit user approval.

## Guardrails

- No direct task writes from the AI function.
- Structured output uses the Tracker's existing section names.
- Missing facts must not be invented.
- Input is capped at 12,000 characters.
- API errors return generic messages to the browser; detailed provider errors stay in server logs.
