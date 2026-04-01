---
name: /roadmap
description: Product roadmap — create, plan versions, add features, track progress, collect feedback
---

# Product Roadmap Command

**Product Owner role.** Plan and track product roadmaps on Outline. Roadmaps sit parallel to Specifications — specs describe current state, roadmaps describe planned state.

Always load `po` skill via `Skill("po")`.

---

## Outline Structure

```
Collection/
└── Product Root/
    ├── Specifications/         ← current state (/pp rewrites)
    ├── Versions/               ← version history
    ├── Cycles/
    ├── Task Reports/
    └── Roadmap/                ← planned state (this command manages)
        ├── (root doc)
        ├── v0.3.0/             (version = milestone)
        │   ├── Module A/       (module doc: spec link + feature checklist)
        │   │   ├── Feature 1   (feature doc)
        │   │   └── Feature 2
        │   └── Module B/
        │       └── Feature 3
        └── v1.0.0/
            └── ...
```

**Checkboxes always live ONE LEVEL UP:**
- Module doc → feature checkboxes
- Version doc → module checkboxes
- Roadmap root → version checkboxes

---

## Input & Mode Detection

```
/roadmap create <product-idea>       → CREATE (new roadmap from scratch)
/roadmap plan <version>              → PLAN (detail a version's features)
/roadmap add <version> <module> <feature>  → ADD (single feature to existing version)
/roadmap status [version]            → STATUS (progress report)
/roadmap feedback <version>          → FEEDBACK (incorporate stakeholder input)
```

---

## CREATE Protocol (New Roadmap)

**Trigger:** `/roadmap create <product-idea>`

### Phase 1 — Discovery

1. Discuss product idea with user — rounds of refinement
2. Identify **components/modules** — what are the major pieces?
3. Map **dependencies** between components (which must come first)
4. Ask: What are the first 2-3 milestones? (e.g., Internal Demo, MVP, Post-MVP)
5. For each milestone, ask: target date? goal? which components?

### Phase 2 — Feature Planning (First Version)

1. For the first version/milestone, break each component into features
2. Each feature = a behavior with clear acceptance criteria (same philosophy as T2 — WHAT, not HOW)
3. Note cross-module features under their primary component with a `## Notes` section listing affected modules
4. Present full plan: version → components → features. User confirms.

### Phase 3 — Execute (if confirmed)

1. **Verify Specifications structure** — for each component in the roadmap, check if a matching spec doc exists under `Specifications/`. If not, create a stub spec doc (Non-Technical Description + Technical Implementation placeholder + Version History). This ensures the roadmap module can link to it.

2. **Create Outline docs** (all via Outline MCP — `create_document`):

   a. **Roadmap root doc** under the product root:
   ```markdown
   # [Product] — Roadmap

   > [One-line vision]

   ## Versions
   - [ ] [v0.3.0](/doc/xxx) — [Goal summary]

   ## Architecture Decisions
   | Date | Decision | Rationale |
   |------|----------|-----------|
   | [today] | [key decisions from discovery] | [rationale] |
   ```

   b. **Version doc** as child of roadmap root:
   ```markdown
   # v0.3.0 — [Milestone Name]

   Target: [YYYY-MM-DD]
   Goal: [What this version proves/delivers]

   ## Modules
   - [ ] [Module A](/doc/xxx) — 0/N
   - [ ] [Module B](/doc/yyy) — 0/N
   ```

   c. **Module docs** as children of version doc:
   ```markdown
   # [Module Name]

   Spec: [Module Name](/doc/spec-doc-id)

   ## Features
   - [ ] [Feature 1](/doc/xxx)
   - [ ] [Feature 2](/doc/yyy)
   ```

   d. **Feature docs** as children of module doc:
   ```markdown
   # [Feature Name]

   Module: [Module Name]
   Version: [vX.Y.Z]

   ## Description
   [What this feature does, user-facing]

   ## Acceptance Criteria
   - [Criterion 1]
   - [Criterion 2]

   ## T1s
   (none yet)

   ## Notes
   [Cross-module dependencies, constraints, references]
   ```

3. **Create Plane milestones** — one per version:
   ```bash
   # Use Plane MCP to create milestone
   name: "v0.3.0 — [Milestone Name]"
   start_date: today
   target_date: milestone target
   ```

4. **Update config** — store `OUTLINE_ROADMAP_DOC_ID` in `config.json` under the project.

### Output

```
Roadmap Created
Product: [name]
Root doc: [outline_url]
Versions: [count] planned
  v0.3.0 — [goal] ([N] modules, [N] features)
Milestones: [count] on Plane
Config: updated with OUTLINE_ROADMAP_DOC_ID
```

---

## PLAN Protocol (Detail a Version)

**Trigger:** `/roadmap plan <version>` — plan or extend a version with features

### Process

1. **Read roadmap root** from Outline — get version list
2. If version doesn't exist → ask to create it (target date, goal)
3. **Read version doc** — current module checklist
4. **Read existing module and feature docs** under this version
5. **Read Specifications** for context on current module state
6. **Propose features** — based on discussion with user:
   - What components need work in this version?
   - What features within each component?
   - What are the acceptance criteria?
   - Are there dependencies on features from earlier versions?
7. **User confirms** feature set
8. **Create Outline docs** — module docs (if new for this version) + feature docs
9. **Update checklists:**
   - Module docs: add feature checkboxes
   - Version doc: add/update module checkboxes with counts
   - Roadmap root: add version checkbox if new version

### Output

```
Version Planned
Version: v0.3.0 — [goal]
Modules: [count] ([new] new)
Features: [count] total ([new] new)
```

---

## ADD Protocol (Single Feature)

**Trigger:** `/roadmap add <version> <module> <feature-description>`

Quick path — add one feature without full planning session.

### Process

1. **Read version doc** — verify version exists
2. **Read module doc** under version — create if doesn't exist in this version
3. **Create feature doc** as child of module doc (using feature doc template)
4. **Update module doc** — add feature checkbox
5. **Update version doc** — update module count
6. If module is new for this version, also:
   - Verify spec doc exists for this module (create stub if not)
   - Add `Spec:` link to module doc
   - Add module checkbox to version doc

### Output

```
Feature Added
Version: v0.3.0
Module: [name]
Feature: [name] ([outline_url])
```

---

## STATUS Protocol (Progress Report)

**Trigger:** `/roadmap status [version]` — read-only progress report

### Process

1. **Read roadmap root** from Outline
2. If version specified → read that version doc + its modules + features
3. If no version → read all version docs
4. **For each feature with T1 links:**
   - Check T1 states on Plane via `node scripts/plane-item-get.js`
   - Derive feature status: no T1s = planned, any T1 in progress = building, all T1s done = done
5. **Report per version:**
   ```
   v0.3.0 — Internal Demo (target: 2026-05-15)
   ├── Org & People: 2/3 features done
   │   ├── ✅ Multi-tenant setup (WCLV1-60 Done)
   │   ├── 🔄 Department tree (WCLV1-61 In Progress)
   │   └── ⬜ 4-role RBAC (no T1 yet)
   └── Timeclock: 0/2 features done
       ├── ⬜ Basic clock-in (no T1 yet)
       └── ⬜ Timesheet view (no T1 yet)

   Progress: 2/5 features done (40%)
   ```

**No writes** — this is read-only. The roadmap stays current because `/pm` and `/pp` update it at action time.

---

## FEEDBACK Protocol (Incorporate Stakeholder Input)

**Trigger:** `/roadmap feedback <version>`

### Process

1. **Read version doc** from Outline
2. **User provides feedback** — from meeting, demo review, HR input, etc.
3. **Analyze impact:**
   - New features needed? → propose additions
   - Existing features changed? → propose edits to acceptance criteria
   - Features to cut? → propose moving to backlog (later version)
   - Priority shifts? → propose reordering
4. **Present proposed changes** — user confirms
5. **Execute confirmed changes:**
   - Create new feature docs
   - Edit existing feature docs (description, acceptance criteria)
   - Move features between versions (update checklists in both)
   - Add feedback notes to version doc:
     ```markdown
     ## Feedback — [date]
     - [feedback point 1]
     - [feedback point 2]
     ```
6. **Update checklists** in module docs and version docs

### Output

```
Feedback Incorporated
Version: v0.3.0
Changes: [N] features added, [N] modified, [N] moved to backlog
Feedback recorded in version doc
```

---

## Critical Rules

1. **Roadmap is optional** — projects without roadmaps work exactly as before. `/roadmap` is additive.
2. **Specs stay untouched** — this command never modifies Specification docs. Specs are maintained by `/pp`.
3. **Module docs link to specs** — `Spec: [Module](/doc/id)` in every roadmap module doc. Verify spec exists on creation.
4. **Checkboxes one level up** — features don't track themselves. Module doc tracks features, version doc tracks modules, root tracks versions.
5. **No points at roadmap level** — points are discovered during `/p` (planning) and `/pp` (push). Roadmap tracks planned/done only.
6. **Features under primary component** — cross-module features live under one module with `## Notes` listing other affected modules.
7. **Confirm before creation** — always present the plan and wait for user approval.
8. **Version = milestone** — semver versions in the roadmap serve as milestones. Use Plane milestones for tracking.

---

<!-- Command version: 1.0 — Initial roadmap command -->
