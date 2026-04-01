---
name: /pp
description: Push + condense — verify implementation, update spec docs, mark work done (local-only)
---

# Push + Condense Command (Local)

Verify completed implementation, update local documentation, and mark work items done.

**Cycle:** `/pm` (plan features) → `/p` (plan implementation) → `/s` (execute) → `/pp` (push + condense)

---

## Input

```
/pp [plan file path]    → Push from completed plan file
```

Read plan file → parse header (work item ID, module, spec link) + phases/tasks.

---

## Preconditions

- All tasks in plan file should be marked `[x]` (implementation complete)
- If unchecked tasks remain → warn user, ask whether to proceed or finish first

---

## Step 1: Deep Research (HARD GATE)

**You MUST complete this step before proceeding. No exceptions.**

- Read every file listed in the plan file's `Tech:` context line
- Read every file that was created or modified during `/s` execution
- Verify implementation matches the phases/tasks described
- For each phase: confirm the code path exists and works

```
Research Complete
Files: [found]/[listed] | Phases: [verified]/[total]
Discrepancies: [count]
[List each discrepancy if count > 0]
```

**Minor differences (code wins):** Renamed files, extra features, different patterns — update plan file to match reality.

**Major contradictions (ask user):** Feature not implemented, fundamentally different approach.

---

## Step 2: Estimate Reassessment

**Always compare actual work against the T2 estimate.** Fibonacci scale:

| Points | Complexity | What it touches |
|--------|-----------|-----------------|
| 1 | Single concern | One file, one component |
| 2 | Two connected concerns | Backend + frontend, or new route with simple page |
| 3 | One end-to-end slice | New service + DTO + component + route |
| 5 | Multiple coordinated slices | Multiple services + DTOs + routes + components |
| 8 | Cross-cutting or high-uncertainty | Auth, middleware, multiple routes, new patterns |

1. Count actual phases, tasks, files changed, and distinct concerns
2. Compare against original estimate

**If estimate changes:**

```
Estimate: {T2-ID} was [N] points → adjusted to [N] points
Actual: [N] phases, [N] tasks, [N] files, [N] concerns
([one-line rationale])
```

Update the T2 entry in `docs/backlog.md` with new estimate: `(Npts, was Mpts)`

**If estimate matches:**

```
Estimate confirmed: {T2-ID} at [N] points
```

---

## Step 3: Mark T2 Done

Update `docs/backlog.md`:
- T2 state → **Done**

---

## Step 4: Update Module Spec Doc

Rewrite `docs/specs/{module-slug}.md` to reflect current state:

1. **Rewrite Non-Technical Description** — current behavior (not append). 2-4 sentences + capability bullets reflecting what exists NOW after this T2's changes
2. **Rewrite Technical Implementation** — current files, components, routes, patterns. Include changes from this T2 alongside what already existed
3. **Append to Version History** (one line):
   - `- [vX.Y.Z] — one-line summary of what changed`

Spec docs must stay concise — agents read these for context.

---

## Step 5: Update Version Doc

Append implementation section to `docs/versions/{vX.Y.Z}/{module-slug}.md`:

```markdown
## [Feature Name] ({T2-ID})

### Summary
- [3-5 bullets of what was implemented]

### Implementation
- Phase A: [description] — [N] tasks
- Phase B: [description] — [N] tasks

### Files Changed
- [list of new/modified files with 1-liner each]
```

**Preserve existing content** (rationale, scope, planning decisions from `/pm` and `/p`). Only append below.

---

## Step 6: Auto-Complete Tier 1

Check if ALL T2 items under the same T1 parent are Done or Cancelled in `docs/backlog.md`.

1. **If all T2s are Done/Cancelled:**
   - Mark T1 as **Done** in `docs/backlog.md`
   - Update product bible (`docs/specs/product-bible.md`) if the completed version introduced:
     - New modules not yet in the Module Map
     - Changed architecture or patterns
     - New user-facing capabilities
   - Report: `Tier 1 sealed: [identifier] — all T2s complete`

2. **If not all complete:**
   - Report: `Tier 1: [N] of [M] T2s complete ([D] Done, [C] Cancelled, [R] remaining)`

---

## Step 7: Run Type Check

```bash
npx tsc --noEmit
```

Report result. Fix any errors before finalizing.

---

## Output

```
Published
T2: [{T2-ID}] marked Done | Estimate: [confirmed/adjusted]
Spec updated: docs/specs/{module}.md
Version doc updated: docs/versions/{vX.Y.Z}/{module}.md
Tier 1: [Done — sealed | N of M T2s complete]
tsc: [pass/fail]
```

---

## Critical Rules

1. **ALWAYS deep research (HARD GATE)** — verify implementation before updating docs
2. **CODE WINS** for minor discrepancies — update plan to match reality
3. **ASK** for major contradictions
4. **Rewrite spec doc** — both sections reflect current state (not append)
5. **Version doc accumulates** — each T2 adds a section
6. **Reassess estimate** — always compare actual vs planned
7. **Auto-complete T1** — check all siblings after every push
8. **Update product bible on T1 seal** — review for new modules, changed architecture
9. **Run tsc** — catch any type issues
