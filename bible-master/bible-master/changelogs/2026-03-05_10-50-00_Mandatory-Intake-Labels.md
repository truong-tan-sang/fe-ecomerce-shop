# Mandatory Intake Labels

**Date:** 2026-03-05 10:50 UTC
**Scope:** `.claude/skills/po/SKILL.md`, `.claude/commands/pa/intake.md`, `pa-config.example.json`, `project-config.example.json`

## What Changed

- Every intake item now requires **two labels**: INTAKE + type label (BUG/FEATURE/TWEAK/IDEA/INQUIRY)
- Added INTAKE label (`#abb8c3`) — enables cross-project Plane views (Plane views can't filter by module, so label is the only way to create a global intake dashboard)
- Added INQUIRY label (`#fcb900`) — previously inquiry items got no label
- Added **Label Bootstrap Protocol** to PO skill — if config is missing label UUIDs, agent must check Plane via `list_labels`, create missing labels, update config, then proceed
- Removed "if unsure, leave labels empty" fallback — labels are now mandatory
- Added `LABEL_INTAKE_UUID` and `LABEL_INQUIRY_UUID` to both config templates

## Why

An agent creating intake items for LC Spark left labels empty because:
1. Spark had no type labels (old DEV/STAG/PROD labels were removed)
2. Instructions said "if unsure, leave labels empty"
3. No INTAKE label existed in the system at all

This meant intake items were invisible in cross-project filtered views. The fix makes labels mandatory and adds a bootstrap protocol so the agent creates missing labels instead of skipping them.

Additionally, Plane rejects non-existent label UUIDs with HTTP 400 — confirmed via testing. Labels must exist before assignment.

## Migration

### Config templates
- Add `LABEL_INTAKE_UUID` and `LABEL_INQUIRY_UUID` to your `project-config.json` or `pa-config.json`
- Run Label Bootstrap Protocol on first `/intake` if UUIDs are missing (agent handles this automatically)

### PO skill
- Re-sync `.claude/skills/po/SKILL.md` — labels section rewritten

### Intake command
- Re-sync `.claude/commands/intake.md` (PA consumers) — label classification updated

### Project labels
- Create INTAKE (`#abb8c3`) and INQUIRY (`#fcb900`) labels in each Plane project
- Create BUG/FEATURE/TWEAK/IDEA labels if they don't exist yet
- Save all UUIDs to config

## Before/After

- Before: Labels optional, INQUIRY gets no label, missing labels → skip silently
- After: Labels mandatory (INTAKE + type), INQUIRY gets INTAKE + INQUIRY labels, missing labels → bootstrap protocol creates them
