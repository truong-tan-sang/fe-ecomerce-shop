---
name: /p
description: Engineer planning — break tier 2 into implementation phases (tier 3) and tasks (tier 4) via local plan file
---

# Engineer Planning Command (Local)

Break a **tier 2 work item** into implementation phases (tier 3) and tasks (tier 4). Creates a **plan file** locally.

**Cycle:** `/pm` (plan features) → `/p` (plan implementation) → `/s` (execute) → `/pp` (push + condense)

---

## Input

```
/p [T2 identifier]          → Plan from backlog item (e.g., /p t2-products-01)
/p [plan file path]          → Resume existing plan
```

---

## PLAN Mode (New Plan File)

### Preconditions

- Find the T2 in `docs/backlog.md` — verify it exists, has a parent T1, and is NOT Done
- Identify the module and version from the T1 title

### Process

1. **Read T2 entry** from `docs/backlog.md` — title, estimate, state
2. **Read T1 parent** — get module, version, execution order
3. **Read module spec** from `docs/specs/{module-slug}.md` — non-technical + technical sections
4. **Read version module doc** from `docs/versions/{vX.Y.Z}/{module-slug}.md` — rationale, scope, planning decisions
5. **Check sibling T2s** — scan `docs/backlog.md` for other T2s under the same T1. Check their states. Scan `cycles/` directory for existing plan files to determine effective state:

   | Backlog State | Local Plan File | Effective State |
   |---|---|---|
   | Done | (any) | Done |
   | In Progress | All tasks `[x]` | Done (local, pending /pp) |
   | In Progress | Some tasks `[x]` | In Progress (partially done) |
   | In Progress | No plan file | In Progress (planned only) |
   | Todo/Backlog | Plan file exists | Planned (local) |
   | Todo/Backlog | No plan file | Not started |

6. **Check execution order** — read the T1's execution order in `docs/backlog.md`. If this T2 has prerequisites:
   - Check if all earlier-step T2s are effectively Done
   - If NOT → **warn the user** with blockers. Don't proceed unless user overrides
   - Read completed siblings' plan files for context on what was already built
7. **Explore the codebase** — read relevant existing files, understand current patterns, routes, components
8. **Check BE API surface** — read `C:\Users\LEGION\.claude\projects\C--Users-LEGION-Downloads-DACN-fe-ecomerce-shop\memory\reference_be_api_surface.md` to verify available endpoints, methods, roles, and request/response shapes for the feature. If cache seems stale, suggest running `/catchup-be` first.
9. **Assess feasibility** — if not doable or needs discussion, surface to user
10. **Q&A rounds** until implementation approach is clear:
   - Component architecture, state management, data flow
   - Edge cases and error handling
   - Phase ordering and dependencies
   - Boundaries with sibling T2 items (avoid overlap)
11. **QA Persistence** — after Q&A, append decisions to `docs/versions/{vX.Y.Z}/{module-slug}.md` under `## Planning Decisions`:
    ```markdown
    ### [T2 Title] — Planning (YYYY-MM-DD)
    - **Decision:** [What was decided]
      **Rationale:** [Why — constraints, rejected alternatives]
    - **Scope boundary:** [What is explicitly excluded]
    ```
12. **Break T2** into phases (tier 3) and tasks within each phase (tier 4)
13. **Create plan file** at `cycles/{YYYY-WW}/{module-slug}/{T1-ID}/{T2-ID}-{feature-slug}.md`
    - `YYYY-WW` = current calendar week
    - Module slug = lowercase, hyphens (e.g., `products`, `auth`, `product-variants`)
14. **User must confirm** before plan file creation

### Plan File Format

```markdown
# [Tier 2 Title]

Work Item: {T2-identifier}
Tier 1: {T1-identifier} [version | Module] Title (state)
Module: [Module Name]
Spec: docs/specs/{module-slug}.md
Version Doc: docs/versions/{vX.Y.Z}/{module-slug}.md
Siblings: [N] total, [N] Done — [T2-ID Feature (state), ...]
Execution Order: Step [N] of [M] — [status]

## Context

Non-tech: [1-2 sentence stakeholder description]
Tech: [key files, components involved]
Related: [other module] — [why related]

## Phase A: [Phase Name]

- [ ] Task 1 description
- [ ] Task 2 description

## Phase B: [Phase Name]

- [ ] Task 1 description
- [ ] Task 2 description
```

### Post-Creation

Update `docs/backlog.md`:
- T2 state → **In Progress**
- T1 state → **In Progress** (if it was Backlog/Todo)

### Output

```
Plan created: cycles/{path}/{filename}.md
Phases: [count] | Tasks: [count]
T2: {identifier} → In Progress
```

---

## RESUME Mode (Existing Plan File)

1. **Read plan file** → show progress summary (checked vs unchecked tasks)
2. **Check drift** → compare plan file vs codebase, flag discrepancies
3. **Process request**: update phases, add tasks, mark tasks, adjust approach
4. **Write back** to plan file
5. **STOP**

---

## Critical Rules

1. **PLANNING ONLY** — never execute code implementation
2. **Rich context required** — plan file must include context from spec and version docs
3. **Confirm before creation** — user approves the plan
4. **Update backlog status** — T2 → In Progress, T1 → In Progress
5. **One plan file per T2** — never merge multiple T2 items into one file
6. **Phases are lettered** — A, B, C (simple letters)
7. **Explore the codebase** — always read existing code before planning. Understand patterns before proposing changes
