---
name: /pm
description: Product management — vision, modules, tier 1 seeds, tier 2 breakdown (local-only)
---

# Product Management Command (Local)

**Manager role.** Plan features at the stakeholder level — modules and behaviors, NOT implementation details.

All tracking is local markdown. No external services.

---

## Input & Mode Detection

```
/pm [description]       → BASE (new version / new project)
/pm [T1 identifier]     → BREAKDOWN (tier 1 → tier 2 features)
/pm catch-up            → CATCH-UP (retroactive baseline for existing project)
```

| Signal in prompt | Protocol |
|-----------------|----------|
| T1 identifier (e.g., `T1-products-01`) | BREAKDOWN |
| Existing codebase, no PM foundation yet | CATCH-UP |
| New project idea, version, feature planning | BASE |

---

## Tier System

```
Tier 1: [vX.Y.Z | Module] Scope seed         → created by /pm BASE
  └─ Tier 2: Feature behavior (estimated)     → created by /pm BREAKDOWN
       └─ Tier 3: Phase A - Name              → created by /p
            └─ Tier 4: Task checkbox           → created by /p
```

### Title Format

```
[vX.Y.Z | Module] T1 Title
[vX.Y.Z | Module] T1 Title > Feature Name
```

### States

`Backlog` → `Todo` → `In Progress` → `Done` | `Cancelled`

---

## BASE Protocol (New Version)

**Trigger:** `/pm` with project idea or version description

### Phase 1 — Discovery

1. Discuss idea with user, rounds of refinement
2. Expand and ask relevant questions for full picture
3. Present high-level, ordered feature set grouped by modules (ordered by implementation dependency)

### Phase 2 — Context Gathering

- Version number (e.g., `v1.0.0`). Check `docs/backlog.md` for existing versions. If bumping, confirm semver level (patch/minor/major)
- Module deadlines (optional)
- Check for unfinished work items from previous versions — confirm: leave active or cancel

### Phase 3 — Confirm with user before proceeding.

### Phase 4 — Execute (if confirmed)

1. **Create/update `docs/backlog.md`** — add T1 entries under the version heading:

   ```markdown
   ## vX.Y.Z

   ### T1: [vX.Y.Z | Module] Title — Backlog {#t1-module-slug-NN}
   - (no T2 breakdown yet)
   ```

   The `{#t1-module-slug-NN}` anchor is the T1 identifier used by other commands.

2. **Create module spec docs** at `docs/specs/{module-slug}.md`:

   ```markdown
   # Module Name

   ## Non-Technical Description
   [Concise current state — 2-4 sentences + capability bullets]

   ## Technical Implementation
   [Key files, components, routes, patterns — or "To be populated during implementation" for new modules]

   ## Version History
   [Empty — populated by /pp]
   ```

3. **Create version module docs** at `docs/versions/{vX.Y.Z}/{module-slug}.md`:

   ```markdown
   # [vX.Y.Z | Module Name]

   ## Rationale
   [Why this work is being done — from the /pm discussion]

   ## Scope
   [What's included and what's explicitly excluded]

   ## Planning Decisions
   [Empty — populated during BREAKDOWN and /p sessions]
   ```

4. **Create/update `docs/specs/product-bible.md`** with:
   - Product Vision — what the product is, who it's for
   - Architecture Overview — tech stack, patterns
   - Module Map — every module with 1-liner description

### Output

```
Created
Version: [vX.Y.Z]
Modules: [count]
Tier 1: [count] seed items
Files: docs/backlog.md, docs/specs/*, docs/versions/*
```

---

## CATCH-UP Protocol (Existing Project Baseline)

**Trigger:** `/pm catch-up` — retroactively create PM foundation for an already-built project

### Phase 1 — Discovery

1. Explore the codebase — routes, components, pages, services
2. Identify logical modules from existing feature areas
3. Present proposed module breakdown to user

### Phase 2 — Context Gathering

Version number (typically `v1.0.0` if no PM system existed before).

### Phase 3 — Confirm with user before proceeding.

### Phase 4 — Execute (if confirmed)

Same artifacts as BASE, but everything is **already built**:

1. **Create `docs/backlog.md`** — T1 entries in **Done** state
2. **Create spec docs** — written from existing code, reflecting current state
3. **Create version docs** — summary of what exists
4. **Create product bible** — from codebase exploration

**No T2 items created** — this is a baseline snapshot. Future work starts with BREAKDOWN.

### Output

```
Baseline Created
Version: [vX.Y.Z] (retroactive)
Modules: [count] (Done)
Files: docs/backlog.md, docs/specs/*, docs/versions/*
```

---

## BREAKDOWN Protocol (Tier 1 → Tier 2)

**Trigger:** `/pm [T1 identifier]` (e.g., `/pm t1-products-01`)

### Preconditions

- Find the T1 in `docs/backlog.md` — verify it exists and is NOT Done
- Read the module spec doc (`docs/specs/{module}.md`)
- Read the version doc (`docs/versions/{version}/{module}.md`)

### Process

1. Read module spec — both non-technical and technical sections
2. Break into feature-level items — **behavior + expectations, NOT implementation steps**
   - T2 describes WHAT should work (pass/fail criteria), not HOW to build it
   - Example: "Google OAuth login with redirect to dashboard" NOT "Build auth hook, create login component"
3. Assign Fibonacci estimates (1, 2, 3, 5, 8):
   - If estimate would be 13 → split into multiple T2 items
   - Maximum allowed estimate is 8
4. Determine execution order — which T2s are foundational, which can be parallelized, which depend on others
5. Present breakdown to user with estimates and rationale
6. Confirm with user

### QA Persistence (after confirmation)

Collect decisions from the session (architectural choices, scope boundaries, rejected alternatives). Append to the version module doc under `## Planning Decisions`:

```markdown
### [T1 Title] — Breakdown (YYYY-MM-DD)
- **Decision:** [What was decided]
  **Rationale:** [Why — rejected alternatives, constraints]
- **Scope boundary:** [What is explicitly NOT included and why]
```

### On Confirmation

Update `docs/backlog.md` — replace the T1's `(no T2 breakdown yet)` with T2 entries:

```markdown
### T1: [v1.0.0 | Products] Product management — Todo {#t1-products-01}
1. T2: Admin product list page (3pts) — Todo {#t2-products-01}
2. T2: Add/edit product form (5pts) — Todo {#t2-products-02}
3. T2: Product variant management (5pts) — Todo {#t2-products-03}

Execution Order:
1. t2-products-01 (foundation — list page needed first)
2. t2-products-02 + t2-products-03 (parallel — independent features)
```

Also update the T1 state to **Todo** (it now has a breakdown).

### Output

```
Breakdown Complete
Tier 1: [identifier] → Todo
Tier 2: [count] features
Total estimate: [sum] points
Execution order: [summary]
```

---

## Version Sealing

**A completed version is sealed permanently.** Once a T1 reaches Done, no new T2 items can be added under it.

| T1 State | Can add T2? | Action |
|----------|-------------|--------|
| Backlog / Todo / In Progress | Yes | BREAKDOWN adds T2 |
| Done | No | Must bump version → new T1 |

---

## Critical Rules

1. **T2 is behavior, not implementation** — describe what works, not how to build it
2. **Always confirm** before creating anything
3. **Max estimate is 8** — split 13-point items
4. **Check for existing work** — don't create duplicate modules
5. **Versions are sealed** — Done T1 = no new T2 under it
6. **Spec docs are current state** — concise, rewritten (not appended) on each update
7. **Versions are app-wide** — never per-module v1.0.0
