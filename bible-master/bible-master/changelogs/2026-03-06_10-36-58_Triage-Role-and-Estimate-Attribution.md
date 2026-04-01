# Triage Role and Estimate Attribution

**Date:** 2026-03-06 10:36 UTC
**Scope:** `CLAUDE.md`, `.claude/commands/project/triage.md`, `docs/pm.md`

## What Changed

1. **Triage role expanded:** `/triage` is now "PM or Engineer" — not engineer-only. The PM has access to the project codebase and can run triage directly.

2. **Technical Context is preliminary:** Triage output is the agent's best guess at what's involved, not a binding plan. Language updated to "preliminary assessment" throughout.

3. **Estimate attribution clarified:** Story points are determined by the agent during `/pm` breakdown (not manually set by the manager). `/pp` reassesses after implementation. The user still approves any changes — the engineer does not silently override the original estimate.

## Why

The previous wording implied:
- Only engineers could run `/triage`, creating an artificial blocking dependency
- The manager manually assigned story points, when in practice the agent determines them based on context
- Technical Context from triage was authoritative, when it's actually a preliminary assessment that may shift during implementation

## Migration

Consumers should re-sync to pick up these changes:
- `CLAUDE.md` — triage role label
- `.claude/commands/project/triage.md` — role, pipeline label, preliminary framing
- `docs/pm.md` — estimate attribution (3 locations: tier table, estimation intro, `/pp` reassessment)

## Before/After

| Area | Before | After |
|------|--------|-------|
| Triage role | `(Engineer)` | `(PM or Engineer)` |
| Triage description | "Technical scoping" | "Technical scoping — preliminary assessment" |
| T2 estimate column | "Fibonacci (manager sets)" | "Fibonacci (agent determines, `/pp` reassesses)" |
| Estimation intro | "Manager sets, not changeable by engineers" | "Agent determines during `/pm` breakdown; `/pp` reassesses after implementation" |
| `/pp` reassessment | "does not silently override the manager's estimate" | "does not silently override the original estimate" |
