---
name: /intake
description: Create or extend a Plane intake item with business context — designed for personal assistant context
---

# Intake Command

**Personal assistant role.** Capture a request and create a Plane intake item with all available business context. This command is designed to be run from a **personal assistant codebase** (not a project codebase) where the agent has access to communications (email, chat, meetings) and organizational memory, but NOT the project source code.

Always load `po` skill via `Skill("po")`.

---

## Why This Command Exists

The intake command is part of a **cross-system handoff** between the personal assistant and the project codebase:

```
PA: /intake → Plane intake item with "Intake Context" (business context)
       ↓
Codebase: /triage → adds "Technical Context" (codebase analysis)
       ↓
Codebase: /pm ACCEPT → routes to module/version/tier
```

The PA can read emails, messages, and organizational memory — but has no access to the project source code. The project codebase agent can read code and technical architecture — but has no access to communications. The Plane intake item bridges the two by carrying context between systems.

---

## Input

```
/intake <type> [project-slug] <description>          → Create new intake
/intake <existing-intake-identifier> <context>       → Append to existing intake
```

When the first argument matches a Plane identifier (e.g., `PROJ-45`), the command enters **append mode** — see [Appending to Existing Intake](#appending-to-existing-intake) below.

### New Intake

**Type is required** — the agent cannot infer type because downstream flows differ:

| Short | Full | Meaning |
|-------|------|---------|
| `in` | `inquiry` | Investigation/question — self-contained, no T1/T2 |
| `fe` | `feature` | New capability, enhancement |
| `bu` | `bug` | Broken behavior, error, regression |
| `id` | `idea` | Research topic, no concrete deliverable |

If the user omits the type, **ask them to specify**. Do not guess.

Examples:
```
/intake fe Fix timezone display in reports
/intake bu wclv1 Login fails after password reset
/intake in HR asking about leave management system capabilities
/intake id Evaluate AI-powered search for knowledge base
```

---

## Process

### 1. Parse Type and Identify Target Project

Extract the type prefix from input. Match the request to the correct Plane project using conversation context, topic keywords, or explicit user input.

Load project constants from `po` skill.

If project is ambiguous, **ask the user**.

### 2. Load Contextual Knowledge

Before building the intake context, load relevant knowledge files from the PA's memory/intel system to enrich the item with full organizational context. This is a lightweight scan — not a full knowledge-base dump.

1. **Scan available knowledge files** — identify what files exist in the PA's knowledge system (e.g., people, projects, processes, timeline, tasks)
2. **Determine relevance** — based on the intake prompt, select which files to load:
   - Mentions people/names → people/org knowledge
   - Mentions tasks/follow-ups → active task list
   - Mentions dates/deadlines → timeline/milestones
   - Mentions systems/processes → process documentation
   - Project context → project knowledge
3. **Load selected files** — read the full content of each relevant file
4. **Load company/workspace context** if not already in the session

**Skip this step** if relevant knowledge was already loaded earlier in the conversation. Don't double-load.

### 3. Read Specifications for Context

Before gathering context, read the project's **Specifications root doc** (Product Bible) from Outline for general understanding of the codebase, its modules, architecture, and terminology.

1. Extract `SPECIFICATIONS_DOC_ID` from the project constants (loaded via `po` skill)
2. Load MCP tool: `ToolSearch("select:mcp__outline__read_document")`
3. Read the Specifications root doc — this is the Product Bible containing: product vision, architecture overview, module map, user journeys
4. Use this as **background context only** — it helps you write a better summary, use correct terminology, and ask smarter clarifying questions

**IMPORTANT:** Do NOT include any module conclusion, module reference, or spec doc link in the intake item. The spec doc is read-only context for the PA agent. Module determination is the triage agent's responsibility — they will read the same spec doc independently with actual code access.

### 4. Identify Assignee

The intake item should be assigned to the project member who will own the request.

1. If the user explicitly names an assignee → look up via `get_project_members` MCP
2. Else read `DEFAULT_INTAKE_ASSIGNEE_UUID` from `.env`
3. If `.env` value is empty → **bootstrap**: call `get_project_members` MCP, list members, let user pick, append to `.env`

Store the resolved member UUID for Step 7.

### 5. Gather Context & Detect References

Collect all available business context from the PA's sources:

- **Current conversation** — what the user described or discussed
- **Recent communications** — emails, messages, meetings read in this session
- **Memory/docs** — organizational knowledge the PA has loaded
- **Do NOT read source code** — the PA doesn't have codebase access

**Plane URL detection:** Scan input and conversation for Plane work item URLs (e.g., `https://plane.example.com/workspace/projects/.../work-items/...`). For each detected URL:

1. Extract the work item UUID from the URL
2. Fetch the referenced item via `plane-item-get.js` or MCP `retrieve_work_item`
3. Read item description and comments for relevant context
4. Include extracted context in the **Related Context** section of the intake description

**Classify:**

- **Priority** — `urgent`, `high`, `medium`, `low`, or `none`
- **Labels** — every intake item gets **two labels**: INTAKE (always) + type label:
  - BUG → INTAKE + BUG
  - FEATURE → INTAKE + FEATURE
  - IDEA → INTAKE + IDEA
  - INQUIRY → INTAKE + INQUIRY

Use label UUIDs from `po` skill / project config. If any label UUID is missing from config, run the **Label Bootstrap Protocol** (see PO skill) before proceeding.

### 6. Confirm with User

Present the draft intake item including type, assignee, priority, and label. **User must confirm** before creation.

For INQUIRY, clearly note: "This will be auto-accepted for investigation."

### 7. Create Intake Item

The creation flow differs by type.

#### 7a. Create the intake item (all types)

Use `create_intake_work_item` MCP tool:

- `name`: concise, action-oriented title
- `description_html`: the Intake Item Description Format (see below)

#### 7b. Set properties (all types)

Use `plane-intake-update.js` to set priority, labels, and assignee.

`create_intake_work_item` does NOT support priority, labels, or assignees. After creation, use the identifier from the response to update via script:

```bash
node scripts/plane-intake-update.js {PROJECT_IDENTIFIER}-{N} --priority medium --labels <intake-uuid>,<type-uuid> --assignees <uuid>
```

Always pass both INTAKE + type label UUIDs (comma-separated).

#### 7c. INQUIRY only — Auto-accept

Inquiry items are auto-accepted immediately because they are self-contained investigations, not work items waiting for PM routing.

1. **Accept the intake item** — use `update_intake_work_item` MCP tool with `status: 1` (accepted)

#### 7d. BUG/FEATURE/IDEA — Stay pending

Do NOT accept here. Acceptance is handled by `/pm ACCEPT` after the item has been triaged.

### 8. Report

**For BUG/FEATURE/IDEA:**

```
Intake Created
Type: [FEATURE/BUG/IDEA]
Project: [project name]
Item: [title] ([IDENTIFIER])
Assigned to: [member name]
Priority: [level]
Label: [label name]
Link: [plane_url]

Next: Run /triage [item-id] in the project codebase to add technical context.
```

**For INQUIRY:**

```
Inquiry Created & Accepted
Project: [project name]
Item: [title] ([IDENTIFIER])
Assigned to: [member name]
Priority: [level]
Labels: INTAKE, INQUIRY
Link: [plane_url]

Auto-accepted.
Next: Optionally run /triage [item-id] for technical context, then investigate.
When resolved: mark Done. If work is needed, create a new /intake bu|fe referencing this item.
```

### 9. Tag Source Todo Item

After successful creation, check if the intake item corresponds to a line in the workspace's `todo.md`. If so, tag it with the intake identifier to mark it as tracked in the PM pipeline.

**Format:** Prepend `(<IDENTIFIER>)` after the date+dash prefix, before the line content:

```
Before: - 2026-03-04 — Extract all intel and send to team
After:  - 2026-03-04 — (PROJA-45) Extract all intel and send to team
```

**Matching logic:**

1. **User specified a todo line** in the `/intake` prompt (e.g., quoted text, line reference) → use that match directly
2. **User did not specify** → quick-scan `<WORKSPACE_FOLDER>/intel/todo.md` for lines that semantically match the intake request
   - If a clear match is found → **ask user to confirm** before tagging: `"Tag this todo line with (<ID>)? [line content]"`
   - If multiple possible matches → present them and ask which one(s)
   - If no match → skip silently (not all intake items originate from todo)
3. Use Edit to modify the matched line in `todo.md`

Tagged lines are skipped by `/i`'s normal todo check-off flow. They are resolved via the intake completion check (`/i check plane for completed intake`), which looks up the Plane item's state and marks it done when the work item is Done/Cancelled.

---

## Appending to Existing Intake

When called with an existing intake identifier, `/intake` appends additional business context to the item instead of creating a new one.

```
/intake <existing-intake-identifier> <additional context>
```

Examples:
```
/intake PROJ-45 Stakeholder replied via email — they also need export to CSV, not just PDF
/intake PROJ-45 Meeting with Nick revealed the deadline moved to March 20
```

### Process

1. Fetch the existing intake item via `plane-intake-get.js`
2. Read the current Intake Context section
3. Load relevant contextual knowledge (same as Step 2 of new intake flow)
4. Gather new context from conversation, emails, chat, memory
5. **Append** to the Details or Related Context subsection — **do not overwrite** existing content. Use the pull → Edit → push workflow:
   - `node scripts/plane-intake-get.js <IDENTIFIER-N>` (saves to `temp/plane/<IDENTIFIER-N>.html`)
   - Read the HTML file → Edit to append new context under the existing Details/Related Context
   - `node scripts/plane-intake-update.js <IDENTIFIER-N> --desc`
6. Report what was appended

### When to Use

- Before `/pm improve` — enrich the intake with new business context that arrived after original creation
- When stakeholder feedback arrives via email/chat that should be captured on the intake
- When new related context is discovered during or after T1 execution
- Any time the PM or operator identifies additional business context for an existing request

---

## Batch Mode

When processing multiple requests from a single communication (e.g., a long email with several asks, or a meeting with multiple action items):

1. Present all proposed intake items as a numbered list (with type, title, priority, label for each)
2. Let the user confirm, modify, or remove items
3. Create all confirmed items sequentially
4. Report all created items with links
5. Tag corresponding todo lines after all items are created (or per-item)

---

## Intake Item Description Format

```markdown
## Intake Context
<!-- Written by /intake (Personal Assistant) -->

**Type:** [Inquiry / Feature / Bug / Idea]
**Source:** [where request came from — email, chat, meeting, direct ask]
**Requested by:** [person name and role]
**Date:** [when request was made]
**Urgency:** [Low / Medium / High / Critical]

### Summary

[2-3 sentence summary of what's needed and why]

### Details

[Full context — communications, constraints, background]

### Related Context

[Related projects, decisions, people — from PA memory]
[Referenced Plane items — description excerpts, comments]

---

## Technical Context
<!-- To be added by /triage in the project codebase -->
```

---

## Inquiry Lifecycle

Inquiry items follow a distinct lifecycle from BUG/FEATURE/IDEA:

```
/intake in → create (INTAKE + INQUIRY labels) → auto-accept
       ↓
PM investigates (optionally runs /triage for technical context)
       ↓
Resolved? → mark inquiry as Done
       ↓
Work discovered? → /intake bu|fe [inquiry-url] <new description>
                   (creates NEW intake item referencing the inquiry)
```

**Key principles:**
- Inquiries are **self-contained** — they never spawn T1/T2 items directly
- If investigation reveals actual work → PM creates a **new** intake item (BUG or FEATURE) that references the original inquiry URL
- The new intake follows the standard pipeline: `/triage` → `/pm ACCEPT` → T1/T2
- The original inquiry stays as a closed record of the investigation

---

## Adopting This Command

When using the PM bible in a **personal assistant** codebase:

1. Copy this command to `.claude/commands/intake.md` (top-level, NOT under `pa/` — avoids `pa:intake` nesting)
2. Set up project constants with Plane IDs (workspace slug, project ID, MCP server name)
3. Ensure the `po` skill has the Intake Item Description Format
4. Configure MCP server for the target Plane workspace

This command pairs with `/triage` (run in the project codebase) to complete the handoff.

---

## Critical Rules

1. **Type is required** — always ask if omitted. Agent cannot infer type.
2. **Always confirm** before creating
3. **PA context only** — no source code analysis
4. **Rich context** — transfer maximum business context into the description
5. **One item per distinct request** — don't merge unrelated asks
6. **Include Technical Context placeholder** — `/triage` expects it
7. **Always set priority** — use `plane-intake-update.js` after creation
8. **Labels are mandatory** — every intake gets INTAKE + type label (two labels). If config is missing label UUIDs, run Label Bootstrap Protocol first
9. **Use the `issue` ID** — the work item UUID from the intake response, not the wrapper ID
10. **No module conclusions in output** — spec doc is read-only context. Never write module names, spec links, or module guesses into the intake item. The triage agent determines modules independently with code access
11. **Always assign** — use `DEFAULT_INTAKE_ASSIGNEE_UUID` from `.env`; bootstrap if empty; override if user specifies
12. **INQUIRY auto-accepts** — accept immediately after setting labels
13. **BUG/FEATURE/IDEA stay pending** — acceptance deferred to `/pm ACCEPT`
14. **Detect Plane URLs** — when input references existing items, fetch and include their context

---

<!-- Command version: 2.4 — Added append mode for existing intake items (pre-improve enrichment) -->
