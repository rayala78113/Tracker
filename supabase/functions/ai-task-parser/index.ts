// Supabase Edge Function: ai-task-parser
// Secrets required in Supabase Edge Functions:
//   OPENAI_API_KEY
// Optional:
//   OPENAI_MODEL (defaults to gpt-5-mini)
//
// This function only proposes task fields. It does not write to the tasks table.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedSections = [
  "Compliance",
  "Maintenance",
  "Operations",
  "Inspections",
  "Admin",
  "Requisition",
  "MOC",
  "Engineering",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: "OPENAI_API_KEY is not configured" }, 500);

    const body = await req.json();
    const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
    if (!notes) return json({ error: "notes is required" }, 400);
    if (notes.length > 12000) return json({ error: "notes is too long" }, 400);

    const model = Deno.env.get("OPENAI_MODEL") || "gpt-5-mini";
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: "Convert the user's rough note into a proposed TSAR Tracker task. Correct spelling, grammar, and obvious transcription errors while preserving the user's intended meaning. Do not add work, recommendations, inspections, verification steps, documentation requirements, dates, deadlines, people, vendors, equipment, costs, regulatory requirements, technical claims, completion status, or other facts that are not explicitly stated or unambiguously implied by the user's note. Do not turn a simple task into a broader scope of work. The notes field should be a concise cleaned-up version of what the user actually said; do not prepend 'Original note' and do not quote the raw input. Choose exactly one Tracker section from the allowed enum based only on the note. Keep the title concise and action-oriented. If no assignee is clearly stated, return an empty assigned_to string. Set followup true only when the user's note explicitly indicates a follow-up, pending item, waiting condition, or future check; otherwise false. The output is a draft for human approval and must not perform work.",
        input: notes,
        text: {
          format: {
            type: "json_schema",
            name: "tracker_task_draft",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                section: { type: "string", enum: allowedSections },
                notes: { type: "string" },
                assigned_to: { type: "string" },
                followup: { type: "boolean" },
                rationale: { type: "string" }
              },
              required: ["title", "section", "notes", "assigned_to", "followup", "rationale"]
            }
          }
        }
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error("OpenAI error", payload);
      return json({ error: "AI task parsing failed" }, 502);
    }

    const outputText = extractOutputText(payload);
    if (!outputText) return json({ error: "AI returned no task draft" }, 502);

    let draft;
    try { draft = JSON.parse(outputText); }
    catch { return json({ error: "AI returned invalid structured output" }, 502); }

    return json({ draft }, 200);
  } catch (error) {
    console.error(error);
    return json({ error: "Unexpected server error" }, 500);
  }
});

function extractOutputText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content?.text === "string") return content.text;
    }
  }
  return "";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
