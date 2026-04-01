# PA Knowledge System and Intake Enhancements

**Date:** 2026-03-05 10:17 UTC
**Scope:** `.claude/commands/pa/i.md` (new), `.claude/commands/pa/intake.md`, `pa-config.example.json` (new), `CLAUDE.md`

## What Changed

### New: `/i` command (`.claude/commands/pa/i.md`)
- Generic knowledge/intel system for PA codebases
- Three modes: load+work (default), save, index
- Workspace-aware via `pa-config.json` — auto-detects workspace from keywords or explicit prefix
- Loads minimum relevant intel files before executing tasks
- Post-task: todo check-off (skips `(<ID>)` markers), new intel discovery
- Intake completion check: `/i check plane for completed intake` — looks up Plane item state, marks done items
- Transcript workflow: speaker diarization, typo detection, intel extraction
- Defines knowledge file structure (todo, done, people, timeline, projects, processes, tools, company)

### New: `pa-config.example.json`
- Extends `project-config.json` with `workspaces` key for multi-company PA routing
- Each workspace: name, folder, comms_mcp, detection_keywords
- Each project links to workspace via `workspace` key
- Label UUIDs (BUG, FEATURE, TWEAK, IDEA) included per project

### Updated: `/intake` command (v2.0 -> v2.1)
- **Step 2: Load Contextual Knowledge** — lightweight intel scan before building intake context
- **Step 9: Tag Source Todo Item** — after creation, tags matching `todo.md` line with `(<IDENTIFIER>)`. User-specified match is direct; auto-scan match requires confirmation; no match skips silently.
- **Batch Mode** section added — numbered list presentation, per-item confirmation, sequential creation
- Report step now includes `([IDENTIFIER])` in output
- Step numbering adjusted (2->3->4->...->8->9) to accommodate new steps

### Updated: `CLAUDE.md`
- PM Lifecycle now includes `/i` command
- Intake pipeline description updated with `/i` and todo tracking
- New "How to Adopt (PA Consumer)" section with full setup guide
- Key Concepts: added knowledge system and PA config entries
- PA Consumer sync ledger: added `i.md` and `pa-config.example.json`
- File Reference table: added new files

## Why

The Bible had no PA-side knowledge management. `/intake` existed but operated in isolation — no intel loading before context gathering, no tracking back to the PA's todo system. The `/i` command and `pa-config.json` make the PA a first-class Bible consumer with its own workspace-aware knowledge system and bidirectional tracking between todo items and Plane intake items.

## Migration

### For PA consumers:

1. Copy new files:
   - `.claude/commands/pa/i.md`
   - `pa-config.example.json` → `pa-config.json` (fill with your values)

2. Update `.claude/commands/pa/intake.md` — re-sync or manually add:
   - Step 2 (Load Contextual Knowledge) after Step 1
   - Step 9 (Tag Source Todo Item) after Report
   - Batch Mode section
   - Renumber all steps accordingly

3. Create workspace folders per `pa-config.json`:
   ```
   <folder>/CONTEXT.md
   <folder>/intel/todo.md
   <folder>/intel/done.md
   <folder>/intel/people.md
   ...
   ```

4. Update your PA's `CLAUDE.md` to reference `/i` for knowledge loading

### For standard consumers:
No changes needed — all new files are PA-only.

## Before/After

**Before:** `/intake` had no intel loading step, no todo tracking. No `/i` command in Bible. PA knowledge system was implementation-specific (not templated).

**After:** `/intake` loads relevant intel (Step 2), tags todo items with intake ID (Step 9). `/i` is a Bible command with workspace routing, intake completion check, and transcript workflow. `pa-config.json` provides multi-workspace config.
