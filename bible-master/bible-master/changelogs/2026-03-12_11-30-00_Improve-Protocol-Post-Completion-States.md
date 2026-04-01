# Improve Protocol & Post-Completion States on Intake

**Date:** 2026-03-12 11:30 UTC
**Scope:** `docs/pm.md`, `.claude/commands/project/pm.md`, `.claude/commands/pa/intake.md`, `.claude/commands/project/triage.md`, `.claude/commands/pa/pi.md`, `CLAUDE.md`

## What Changed

1. **Post-completion states moved from T1 to intake.** T1 terminal state is now Done. Passed, Announced, Approved, and Deployed are tracked on the intake item only.

2. **New `/pm improve` protocol.** When an intake is Done/Passed/Announced but work is insufficient or new context arrives, PM creates new T1(s) under the same intake, updates the tracking checklist, and rolls the intake back to Todo. Never revert a T1's state. Approved intakes are final — create a new intake instead.

3. **`/intake` append mode.** `/intake <existing-id> <context>` appends business context to an existing intake item (pre-improve enrichment from emails/chat/meetings).

4. **`/triage` re-triage support.** Running `/triage` on an item with existing Technical Context performs an additive update instead of a fresh triage. Used when new modules are involved or scope has expanded.

5. **`/pi` updated.** Post-Completion States section clarified to reflect intake-level states. Stakeholder feedback path now references `/pm improve` instead of creating separate intake items.

## Why

Gap identified: the Bible had no documented process for when PM testing or stakeholder review determines work is insufficient. PMs were manually dragging T1s backward in Plane, breaking the intake tracking pipeline. The improve protocol provides a forward-only mechanism — existing T1s stay at their state, new trackable T1(s) are created, and the intake lifecycle resets cleanly.

## Migration

**For standard consumers (project codebases):**
- Re-sync `pm.md` (v2.9 → v3.0) — new IMPROVE protocol, updated mode detection, new critical rules
- Re-sync `triage.md` (v1.7 → v1.8) — re-triage section added
- Re-sync `docs/pm.md` — Post-Completion Pipeline rewritten

**For PA consumers:**
- Re-sync `intake.md` (v2.3 → v2.4) — append mode added
- Re-sync `pi.md` (v1.0 → v1.1) — post-completion states clarified

**No script changes required.** `plane-intake-handling.js` already supports adding T1s and ticking them. `plane-item-update.js` already supports `--state todo` for intake rollback.

## Before/After

- **Before:** Post-completion states (Passed/Announced/Approved/Deployed) applied to T1 items. No documented path for QA failure or stakeholder rejection beyond "create additional intake items."
- **After:** Post-completion states belong to intake items. T1 terminal state = Done. `/pm improve` extends the same intake with new T1(s), rolling it back to Todo. Optional `/intake` append and `/triage` re-triage for enrichment before improve.
