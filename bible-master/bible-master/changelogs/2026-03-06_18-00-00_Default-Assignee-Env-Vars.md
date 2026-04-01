# Default Assignee Env Vars

**Date:** 2026-03-06 18:00 UTC
**Scope:** .env.example, .claude/skills/po/SKILL.md, .claude/commands/project/pm.md, .claude/commands/pa/intake.md, CLAUDE.md

## What Changed

Added two `.env` variables for default assignees:
- `DEFAULT_INTAKE_ASSIGNEE_UUID` — used by `/intake` for new intake items
- `DEFAULT_ITEM_ASSIGNEE_UUID` — used by `/pm` and `/pp` for T1-T4 work items and cycle `owned_by`

Resolution order: explicit user request > `.env` default > bootstrap (list members, user picks, save to `.env`).

## Why

The previous approach (removed MEMBER_1, always ask user) created unnecessary friction — the agent asked for assignee on every item creation. Most projects have a single primary assignee. The `.env` approach provides a sensible default that's set once and reused, while still allowing per-item overrides.

## Migration

1. Add to your `.env`:
   ```
   DEFAULT_INTAKE_ASSIGNEE_UUID=
   DEFAULT_ITEM_ASSIGNEE_UUID=
   ```
2. On first use, the agent will list project members and let you pick — the chosen UUID is saved automatically.
3. Re-sync commands and PO skill via `/bible-sync`.

## Before/After

- Before: Agent always asks user for assignee (or used hardcoded MEMBER_1)
- After: Agent reads default from `.env`, only asks on first use (bootstrap) or when user explicitly overrides
