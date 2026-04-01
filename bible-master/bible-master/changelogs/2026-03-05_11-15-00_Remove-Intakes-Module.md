# Remove Intakes Module

**Date:** 2026-03-05 11:15 UTC
**Scope:** `pa-config.example.json`, `project-config.example.json`, `.claude/skills/po/SKILL.md`, `.claude/commands/pa/intake.md`, `.claude/commands/project/pm.md`, `.claude/commands/project/pp.md`, `CLAUDE.md`

## What Changed

- **Removed `INTAKES_MODULE_ID`** from all config templates and PO skill constants
- **Removed Intakes module assignment** from `/intake` (INQUIRY auto-accept), `/pm` ACCEPT, and `/pm` TRIAGE
- **INTAKE label replaces Intakes module** for cross-project view filtering — Plane views can filter by label but not by module
- **Added intake back-reference in T1 descriptions** — when `/pm ACCEPT` creates a T1 from an intake item, the T1 description now includes `Intake: [PROJ-N](url)`. This gives `/pp` a direct link instead of searching.
- **Simplified `/pp` intake finding** — reads T1 description for `Intake:` line instead of searching all items in Intakes module

## Why

The Intakes module served one purpose: enabling a Plane custom view of all intake items. But Plane views can't actually filter by module — they can filter by label. The INTAKE label (added in the same session) replaces this function entirely.

Additionally, the module assignment had ordering constraints (must accept before assigning module) and added complexity to both `/intake` and `/pm` ACCEPT. Removing it simplifies the flow.

The intake back-reference in T1 descriptions solves a second problem: `/pp` previously had to search all items in the Intakes module to find which intake linked to the current T1. Now the link is stored directly in the T1 description — no search needed.

## Migration

### Config
- Remove `INTAKES_MODULE_ID` from `project-config.json` / `pa-config.json`

### Commands
- Re-sync `/intake`, `/pm`, `/pp` commands
- Re-sync PO skill

### Existing Intakes module
- The module can remain in Plane (it won't cause errors) but is no longer used by the workflow
- Existing intake items in the module are unaffected — they just won't get new items assigned to the module

## Before/After

- Before: Intake items assigned to Intakes module for view filtering; `/pp` searches module items for tracking
- After: INTAKE label handles view filtering; T1 descriptions contain `Intake: [PROJ-N](url)` back-reference; `/pp` reads T1 description directly
