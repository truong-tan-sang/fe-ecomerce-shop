---
name: /i
description: Knowledge system — load intel for tasks, save new intel, manage todo tracking with Plane intake integration
---

# Intel Command

**Personal assistant role.** Load organizational knowledge before tasks, save new intel after tasks, and manage todo items with Plane intake tracking.

User's input: $ARGUMENTS

---

## Configuration

This command uses `config.json` for workspace routing. Each workspace has:
- `folder` — where `intel/` and `CONTEXT.md` live (e.g., `ws1/intel/`)
- `comms_mcp` — communication MCP server name
- `detection_keywords` — terms that identify this workspace
- `projects` — linked Plane projects (via `config.json` projects with matching `workspace`)

---

## Step 0: Determine Intent and Workspace Scope

### Intent Detection

- **Load + work** (default): user provides a task → load relevant intel, then execute
- **Save**: user provides a fact/update to store (e.g., "save: new hire started", "remember: John moved to team B") → save it to the right intel file
- **Index** (no args): show all intel files across workspaces

### Workspace Detection

Identify which workspace this relates to using `config.json`:

1. Check for explicit prefix: `/i ws1 <task>` or `/i ws2 <task>`
2. Match `detection_keywords` from config against the user's input
3. If ambiguous, check both workspaces

---

## Load + Work Flow

### Step 1: Scan intel headers

Use Glob to find all `<WORKSPACE_FOLDER>/intel/*.md` files, then use Read with `limit: 2` on each to get titles and descriptions.

If scope is multiple workspaces, scan all matching `<folder>/intel/*.md`.

Also read `<WORKSPACE_FOLDER>/CONTEXT.md` for workspace-specific context.

### Step 2: Determine relevance

Based on the user's task, decide which intel files to load:
- Mentions people/names → `people.md`
- Mentions tasks/actions/what to do next → `todo.md` (never load `done.md` unless user asks about completed tasks)
- Mentions dates/deadlines/events/milestones → `timeline.md`
- Drafting emails/communication → `people.md` + `processes.md`
- Mentions Plane/Outline/tools → `tools.md`
- Project status or systems → `projects.md`
- Company politics/context → `company.md`
- Mentions a transcript or meeting recording → check `transcripts/` folder
- Sync messages/chat → check for workspace-specific sync files
- Multiple topics → load multiple files, but only what's needed

**Load the minimum set of files needed.** Don't load everything.

### Step 3: Load relevant files

Read the full content of each relevant intel file using the Read tool.

### Step 4: Execute the task

With context loaded, **immediately start working on the user's task.** Do not summarize what you loaded or announce which files you read. Just use the context naturally and deliver results.

### Step 5: Todo check-off

After completing the task, check the relevant workspace's `todo.md` for items that may have been accomplished by the work just done.

1. Read `<WORKSPACE_FOLDER>/intel/todo.md` (if not already loaded)
2. Compare items against the actions taken in the conversation
3. **Skip lines with `(<IDENTIFIER>)` markers** (e.g., `(PROJA-45)`) — these are tracked in Plane, not manually completed. They have their own completion flow (see "Intake completion check" below).
4. If any non-intake items appear to have been completed:
   - List each matching item and briefly explain why you think it's done
   - **Ask the user to confirm** which ones to check off
   - Only after confirmation:
     a. **Remove** the item from `todo.md` using Edit
     b. **Append** the item to `<WORKSPACE_FOLDER>/intel/done.md`
5. If no items match, skip silently — do not mention this step

#### Intake completion check

When the user asks to check Plane for completed intake items (e.g., `/i check plane for completed intake`, `/i ws1 check intake status`):

1. Read `<WORKSPACE_FOLDER>/intel/todo.md` — collect all lines with `(<IDENTIFIER>)` markers (e.g., `(PROJA-45)`)
2. For each marker, extract the Plane identifier (e.g., `PROJA-45`)
3. Look up the project from the identifier prefix in `config.json`
4. Use `ToolSearch("select:mcp__<MCP_SERVER>__retrieve_work_item_by_identifier")` to check the item's state
5. If the work item state is **Done/Completed/Cancelled**:
   - List the item and its current state
   - **Ask user to confirm** check-off
   - After confirmation: remove from `todo.md`, append to `done.md`
6. If still in progress — report status but leave the todo line unchanged

### Step 6: New intel check (ALWAYS runs)

This step runs **even if no intel was loaded** in earlier steps, and **even if the task was simple**. The conversation itself is the source — scan it for facts worth persisting.

Review the full conversation for any **new facts worth persisting** — e.g., a person's role changed, a new process was established, a decision was made, a new tool or channel was introduced, pricing/cost info was confirmed, a status changed.

1. Quickly scan headers of relevant intel files (Read with `limit: 5`) to compare against what happened in the conversation
2. Identify gaps: facts from the conversation that aren't yet captured in intel
3. If new intel is found:
   - Present a brief summary of what would be saved and to which file
   - **Ask the user to confirm** before writing anything
   - If confirmed, follow the Save flow below
4. If nothing new — skip silently, do not mention this step

---

## Save Flow

1. **Scan existing intel files:**
   - Use Glob to find all `<WORKSPACE_FOLDER>/intel/*.md` files
   - Use Read with `limit: 5` on each file to see their headers and top-level structure

2. **Analyze the input:**
   - What topic does this relate to? (people, projects, tools, processes, timeline, todo, company, or new?)
   - Is this an action item/task? → `todo.md` (not timeline)
   - Is this an event/milestone/deadline? → `timeline.md` (not todo)
   - Is this NEW information or an UPDATE to something already stored?

3. **If UPDATING existing info:**
   - Read the full relevant intel file
   - Find the entry that needs updating
   - Use Edit to replace the outdated information in place
   - Do NOT create duplicate entries — update in place

4. **If ADDING new info to an existing file:**
   - Read the full relevant intel file
   - Find the appropriate section
   - Use Edit to append under the right heading
   - Keep entries concise — bullet points with dates, not narratives

5. **If this is a NEW TOPIC that doesn't fit existing files:**
   - Create a new file in `<WORKSPACE_FOLDER>/intel/` with this header format:
     ```
     # Topic Title
     <!-- One-line description of what this file contains -->
     ```
   - Write the content below the header

6. **Confirm to the user:**
   - What was saved (quote the key fact)
   - Which file it was written to (include workspace prefix)
   - If anything was replaced, note what changed

---

## If no arguments provided

Show an index of ALL workspaces:
- For each workspace, list every intel file with its title and description
- Tell the user: "Use `/i <task>` or `/i <workspace> <task>` to load relevant intel and start working."

---

## Transcript Workflow

Raw meeting transcripts live in `transcripts/` with naming `yyyy-mm-dd.hh-mm-ss.transcript.txt`. They are generated by transcription tools with speaker diarization (SPEAKER_00, SPEAKER_01, etc.).

When the user says "new transcript" or "transcribe meeting":

1. Read the transcript file from `transcripts/`
2. If transcript contains `[SPEAKER_XX]` labels:
   a. List all unique speaker labels with 5-8 example lines from each (spread across the transcript, not just the first few)
   b. Ask the user to identify who is who
   c. Once identified, replace all speaker labels in the transcript using:
      ```bash
      sed -i 's/\[SPEAKER_00\]/[Name1]/g; s/\[SPEAKER_01\]/[Name2]/g' transcripts/FILE.txt
      ```
3. **Transcription typo check**: Names and words in transcripts may be misspelled or misheard. Before saving intel:
   - Flag any names that look like phonetic misspellings of known people
   - Flag unfamiliar names or terms that could be typos — **confirm with the user** before assuming correctness
   - When in doubt, ask — don't silently propagate a transcription error into intel files
4. Extract actionable intel (decisions, facts, assignments, deadlines)
5. Propose saving extracted intel to the appropriate `<workspace>/intel/` files
6. After confirmation, save intel and move the processed transcript to `<WORKSPACE_FOLDER>/transcripts/` with a descriptive name (e.g., `<WORKSPACE_FOLDER>/transcripts/2026-03-01.sprint-review.transcript.txt`)

Transcripts are raw source material — extract and consolidate into intel files, don't leave knowledge only in transcripts. After processing, raw files in `transcripts/` should be moved to `<WORKSPACE_FOLDER>/transcripts/` so they're archived per-workspace.

---

## Knowledge File Structure

Each workspace folder follows this structure:

```
<workspace>/
├── CONTEXT.md                    ← workspace overview, tools, communication norms
├── intel/
│   ├── todo.md                   ← active tasks (moved to done.md on completion)
│   ├── done.md                   ← completed task archive
│   ├── people.md                 ← people, roles, relationships
│   ├── timeline.md               ← events, milestones, deadlines
│   ├── projects.md               ← project status, systems overview
│   ├── processes.md              ← documented workflows
│   ├── tools.md                  ← tool setup, access, integrations
│   ├── company.md                ← org structure, context, politics
│   └── [topic].md                ← additional topic files as needed
└── transcripts/                  ← processed transcripts (moved from transcripts/ after processing)
```

### File header format

Every intel file starts with:
```
# Topic Title
<!-- One-line description of what this file contains -->
```

### Todo format

```
- YYYY-MM-DD — Task description
- YYYY-MM-DD — (PROJA-45) Task tracked in Plane pipeline
```

Lines with `(<IDENTIFIER>)` markers (e.g., `(PROJA-45)`) are managed by the `/intake` command and checked off via the intake completion flow, not manual completion.

---

## Rules

- Keep saved entries concise — bullet points, not paragraphs
- **Always prefix entries with YYYY-MM-DD timestamp** when adding to `timeline.md` or `todo.md`
- For `todo.md`, format: `- YYYY-MM-DD — Task description` (no checkboxes — completed items are moved to `done.md`)
- **Never load `done.md` for task context** — it's an archive. Only load `todo.md` for active items. Only read `done.md` if user explicitly asks about completed tasks.
- Action items and tasks go to `todo.md`, NOT `timeline.md`. Timeline is for events, milestones, and deadlines only.
- If save input is vague, ask for clarification before saving
- Never store passwords, tokens, or credentials in intel files
- If new info contradicts an existing entry, replace the old one and note the change

---

<!-- Command version: 1.1 — Transcript structure: raw in transcripts/, processed moved to <workspace>/transcripts/ -->
