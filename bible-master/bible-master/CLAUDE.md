# Bible

Centralized, codebase-agnostic template library for AI-assisted engineering. Two chapters:

1. **PM Workflow** — Product Management framework with Plane + Outline
2. **Skills Library** — Reusable AI engineering skills organized by tech stack

## What This Is

### Chapter 1: PM Workflow

Portable PM framework that coordinates **Plane** (task tracking) and **Outline** (documentation) through role-based commands:

- **Commands** (`.claude/commands/`) — 12 slash commands in `shared/`, `project/`, and `pa/` subfolders
- **PO Skill** (`.claude/skills/po/`) — templatized project constants for Plane + Outline
- **Scripts** (`scripts/`) — Plane API utilities that bypass MCP token limits
- **PM Documentation** (`docs/`) — canonical workflow reference

### Chapter 2: Skills Library

Reusable engineering skills (`.claude/skills/bible-*/`) that teach AI agents consistent patterns for frontend, backend, and infrastructure. Each skill is domain-isolated and framework-agnostic within its domain.

- **Catalog** (`.claude/skills/catalog.json`) — index of all skills with categories
- **19 skills** across 7 categories: react, antd-v6, tanstack, supabase, env, project, meta
- **Authoring guide** (`bible-authoring`) — how to write Bible-ready skills
- **Extension convention** (`bible-skill-extension`) — how consumers extend without modifying

## PM Lifecycle

```
/i       (PA)       → Intel: load knowledge, execute task, save new intel
/intake  (PA)       → Capture: create intake item with business context
/roadmap (PA)       → Roadmap: create product roadmaps, plan versions, track progress
/triage  (PM or Engineer) → Scope: read codebase, add preliminary technical context to intake item
/pm      (Manager)  → Accept: route triaged intake to module/version, create T1(s) only
/pm      (Manager)  → Roadmap: route roadmap feature to module/version, create T1(s)
/pm      (Manager)  → Improve: extend Done/Passed/Announced intake with new T1(s)
/pm      (Manager)  → Vision, modules, tier 1 seeds, Outline specs
/pm      (Engineer) → Breakdown: tier 1 → tier 2 features with estimates + QA persistence
/p       (Engineer) → Plan: tier 2 → plan file with phases/tasks + QA persistence
/s       (Engineer) → Execute: implement locally, skill-aware
/pp      (Engineer) → Push: tier 3+4 to Plane, auto-condense Outline specs, roadmap cascade
/pi      (PM)       → Post-intake: task report on Outline, announce to stakeholders
/rp      (Reporter) → Report: generate cycle report from Done work
```

Utility: `/load-skills` — discover and load project skills for convention-aware context.
Utility: `gitpush` — smart commit grouping with Plane/Outline context.
Utility: `/bible-sync` — sync consumer codebase with Bible updates.

## Intake Pipeline (Cross-System)

The intake pipeline bridges a **personal assistant** (which reads communications but has no code access) with the **project codebase** (which has code but no communication access). The Plane intake item carries context between the two systems. The **INTAKE label** enables cross-project visibility via Plane custom views.

```
PA codebase: /intake → creates Plane intake item with "Intake Context"
                ↓         (business context, assignee)
Project codebase: /triage → adds "Technical Context" to the same item
                ↓         (codebase analysis: affected modules, files, complexity)
Project codebase: /pm ACCEPT → routes item to module(s)/version, creates T1(s) only
                ↓         (T1s linked via tracking checklist; no T2s yet)
Project codebase: /pm [T1] → BREAKDOWN: tier 1 → tier 2 features with estimates
```

**Why two commands instead of one?** The PA has organizational memory, email, chat, and meeting context — but no source code. The project agent has the codebase — but no communications. The intake item is the handoff artifact. Each agent contributes what only it can see.

- `/i` runs in the PA codebase. It manages the knowledge system — loading intel before tasks, saving new intel after, and tracking todo items with intake markers for Plane pipeline integration.
- `/intake` is designed for personal assistant codebases. It loads relevant intel, creates the intake item with rich business context (INTAKE + type labels), assigns a project member, and tags the source todo item. Requires explicit type: `in/fe/bu/id` (inquiry/feature/bug/idea). INQUIRY items are auto-accepted immediately. BUG/FEATURE/IDEA items wait for PM routing. Can also **append context to existing intake items** (`/intake PROJ-45 <context>`) for pre-improve enrichment.
- `/triage` runs in the project codebase. It reads code, assesses technical impact, and appends findings.
- `/pm` ACCEPT receives a fully-contextualized item, makes the PM routing decision, creates T1(s) across affected modules (with intake back-reference in T1 description), and adds them to the intake item's tracking checklist via `plane-intake-handling.js`. **ACCEPT creates T1s only — no T2s.** T2 breakdown requires technical design and is done separately via `/pm [T1 link]`.
- `/pm` BREAKDOWN (triggered by passing a T1 link) decomposes a T1 into tier 2 features with estimates. This is the step that requires engineering expertise.

Items submitted directly in Plane (by ops staff, not through `/intake`) skip to `/triage` or go through `/pm` TRIAGE for inline processing.

## Skills Library

### Categories

| Category | Skills | Description |
|---|---|---|
| `project` | `bible-project-structure` | Monorepo skeleton, workspace config |
| `react` | `bible-react-naming`, `bible-react-provider-context`, `bible-react-code-style`, `bible-react-hotkeys` | React patterns, naming, state, code style |
| `antd-v6` | `bible-antd-components` | Ant Design v6 theming, feedback, icons |
| `tanstack` | `bible-tanstack-query-mutation`, `bible-tanstack-store`, `bible-tanstack-router` | TanStack Query, Store, Router patterns |
| `supabase` | `bible-supabase-schema`, `bible-supabase-migrations`, `bible-supabase-edge-functions`, `bible-supabase-cli`, `bible-supabase-auth`, `bible-supabase-sdk`, `bible-supabase-options` | Schema, migrations, auth, SDK, edge functions |
| `env` | `bible-env-variables` | Centralized environment variable management |
| `meta` | `bible-skill-extension`, `bible-authoring` | Skill authoring and extension conventions |

### Key Principles

- **Domain isolation**: Each skill covers ONE domain. No Supabase in TanStack skills, no ANTD in mutation skills. Cross-references use "see your {domain} skill".
- **Each skill owns its paths**: `bible-react-naming` defines `src/pages/`, not `bible-project-structure`.
- **Agnostic examples**: Generic names (`Page_Dashboard`, `App_Modal`), no project-specific references.
- **Defaults with onboarding**: Skills use defaults (e.g., `App_` prefix). Consumer onboarding confirms/replaces.
- **Extension, not modification**: Consumers extend Bible skills via `ext-{bible-skill-name}` pattern (see `bible-skill-extension`).

### Adopting Skills

Skills are adopted per-skill via `/bible-sync`. Adopted skills are copied to `.claude/skills/bible-{name}/` in the consumer. The consumer's `skill-onboarding.md` records decisions and scaffolding status.

### Cross-Project Standard Prefixes

These are enforced everywhere — NOT onboarding decisions:

| Prefix | Entity |
|---|---|
| `Page_*` / `Page[Name]_*` | Pages / page subcomponents |
| `useQ_*` / `q*` | Query hooks / variables |
| `useM_*` / `m*` | Mutation hooks / variables |
| `Provider_*` / `useProvider_*` / `p*` | Context providers |
| `Store_*` / `useStore_*` | TanStack stores / selectors |
| `service_*` / `s*` | Singleton services |
| `const_*` | Constants |
| `UI_*` | Pure reusable components |
| `Utils_*` / `utils_*` | Global / domain-scoped utilities |
| `useHotkeys_*` | Hotkey hooks |
| `sb_*` | Supabase SDK response variables |

The only prefix that varies per project: the custom **shared component prefix** (default `App_`, e.g., `App_Modal`, `Spark_Switch`).

## How to Adopt (Standard Consumer — Project Codebase)

### 0. Clone the Bible

```bash
git clone https://github.com/aiursoftware/bible.git .bible
echo '.bible/' >> .gitignore
```

The `.bible/` folder is a local, gitignored clone of this repo. `/bible-sync` reads from it to apply updates — no external path needed.

### 1. Copy files into your project

Commands go to top-level `.claude/commands/` (not under `project/`):

```
Bible: .claude/commands/project/pm.md         → Your project: .claude/commands/pm.md
Bible: .claude/commands/project/p.md          → Your project: .claude/commands/p.md
Bible: .claude/commands/project/s.md          → Your project: .claude/commands/s.md
Bible: .claude/commands/project/pp.md         → Your project: .claude/commands/pp.md
Bible: .claude/commands/project/rp.md         → Your project: .claude/commands/rp.md
Bible: .claude/commands/project/triage.md     → Your project: .claude/commands/triage.md
Bible: .claude/commands/project/gitpush.md    → Your project: .claude/commands/gitpush.md
Bible: .claude/commands/project/load-skills.md → Your project: .claude/commands/load-skills.md
Bible: .claude/commands/shared/bible-sync.md  → Your project: .claude/commands/bible-sync.md
.claude/skills/po/SKILL.md
scripts/config-get.js
scripts/lib/config.js
scripts/lib/plane-parse-id.js
scripts/lib/plane-api.js
scripts/plane-latest-version.js
scripts/plane-cycle-items.js
scripts/plane-work-items.js
scripts/plane-item-get.js
scripts/plane-item-update.js
scripts/plane-item-create.js
scripts/plane-intake-get.js
scripts/plane-intake-update.js
scripts/plane-intake-handling.js
scripts/outline-pull.js
scripts/outline-push.js
scripts/outline-upload.js
```

### 2. Fill config

`config.json` is synced from the Bible with placeholder values. Fill it with one workspace and one project containing your Plane and Outline values:
- Plane: workspace slug, project ID, project identifier, base URL, MCP server name
- Default assignees: `DEFAULT_INTAKE_ASSIGNEE_UUID` and `DEFAULT_ITEM_ASSIGNEE_UUID` in `.env` — bootstrapped on first use (agent lists members, user picks, saved to `.env`)
- States: UUID for Backlog, Todo, In Progress, Done, Passed, Announced, Approved, Deployed, Cancelled
- Estimates: UUID for each Fibonacci point value (1, 2, 3, 5, 8, 13)
- Labels: UUID for INTAKE, BUG, FEATURE, TWEAK, IDEA, INQUIRY (or use Label Bootstrap Protocol)
- Outline: base URL, root doc ID, specifications/versions/cycles/task-reports doc IDs, collection ID

### 3. Set up environment

```bash
cp .env.example .env
# Fill in API keys: PLANE_API_KEY, OUTLINE_API_KEY, etc.
```

### 4. Fill the PO skill template

Read `config.json` and replace all `${PLACEHOLDER}` variables in `.claude/skills/po/SKILL.md` with your project values. The agent handles this directly — no script needed.

### 5. Generate MCP config

Create `.mcp.json` with MCP server entries for Plane + Outline, reading API keys from `.env` and server config from `config.json`. The agent writes this file directly.

### 6. Adopt Bible skills

Run `/bible-sync` to browse and adopt skills from the Skills Library:

```bash
/bible-sync              # shows available skills, adopt interactively
```

Adopted skills are copied to `.claude/skills/bible-{name}/`. The agent runs each skill's `## Onboarding` section (decisions + scaffolding) and records results in `.claude/skill-onboarding.md`.

### 7. Add project-specific skills

Add your own skills under `.claude/skills/` for project-specific patterns. To extend a Bible skill without modifying it, use the `ext-` prefix convention (see `bible-skill-extension`).

---

## How to Adopt (PA Consumer — Personal Assistant Codebase)

PA consumers manage multiple workspaces/companies and use the knowledge system (`/i`) alongside the PM workflow.

### 0. Clone the Bible

```bash
git clone https://github.com/aiursoftware/bible.git .bible
echo '.bible/' >> .gitignore
```

The `.bible/` folder is a local, gitignored clone of this repo. `/bible-sync` reads from it to apply updates — no external path needed.

### 1. Copy all shared files from standard consumer (above), plus PA files

PA commands go to top-level `.claude/commands/` (not under `pa/`):

```
Bible: .claude/commands/pa/intake.md  → Your project: .claude/commands/intake.md
Bible: .claude/commands/pa/i.md       → Your project: .claude/commands/i.md
```

Do **not** copy `project/*` commands — PA consumers don't use them.

### 2. Fill config

Same as standard consumer — `config.json` supports both. PA consumers add multiple workspaces with PA-specific fields:
- `folder` — local folder for `CONTEXT.md` and `intel/` files
- `comms_mcp` — MCP server for communications (Teams, Slack, etc.)
- `detection_keywords` — terms for auto-detecting which workspace a request targets

Standard consumers omit these optional fields.

### 3. Create workspace folders

For each workspace in `config.json`:

```
<folder>/
├── CONTEXT.md                    ← workspace overview, tools, communication norms
└── intel/
    ├── todo.md                   ← active tasks
    ├── done.md                   ← completed task archive
    ├── people.md                 ← people, roles, relationships
    ├── timeline.md               ← events, milestones, deadlines
    └── ...                       ← additional topic files as needed
```

Every intel file starts with:
```markdown
# Topic Title
<!-- One-line description of what this file contains -->
```

### 4. Set up CLAUDE.md

Your PA's `CLAUDE.md` should include:
- Workspace/company table with short names, folders, and user's role at each
- MCP server mapping per workspace
- Routing rules for workspace detection
- Reference to `/i` for knowledge loading and `/intake` for pipeline capture

### 5. Configure MCP servers

PA codebases typically have multiple MCP servers (one per workspace for Plane, one per workspace for communications, shared Outline). Ensure all are configured and prefixed by workspace.

## Keeping in Sync

After initial adoption, use `/bible-sync` to pull Bible updates into your project.

```bash
/bible-sync              # sync — auto-fetches .bible/, applies updates, tracks divergences
/bible-sync --status     # read-only — shows what would change
```

The command maintains `.claude/bible-sync.md` in your project, which tracks:
- **Last synced commit** — so the agent only diffs what actually changed
- **Per-file status** — `synced` (safe to overwrite), `diverged` (has intentional differences), `skipped` (not used)
- **Divergence notes** — why your project does something differently

On re-sync, `synced` files auto-update. `diverged` files are flagged for review with both the Bible's changes and your notes visible. `skipped` files are left alone.

## Key Concepts

- **Tier system**: Tier 1 (module-version seed) → Tier 2 (feature behavior) → Tier 3 (phase) → Tier 4 (task)
- **Post-completion pipeline**: Done → Passed (PM QA) → Announced (`/pi` sends task report + email) → Approved (stakeholder OK) → Deployed (live in production). **These states belong to the intake item, not T1s** — T1 terminal state is Done. Passed/Approved/Deployed are manual PM milestones; `/pi` handles the Done→Announced transition with Outline task report and stakeholder notification.
- **Improve path**: When an intake is Done/Passed/Announced but work is insufficient or new context arrives, `/pm improve` creates new T1(s) under the same intake, updates the tracking checklist, and rolls the intake back to Todo. Never revert a T1's state — always create new T1(s). Approved intakes are final; create a new intake instead.
- **Version sealing**: Done tier 1 = sealed. New work requires version bump.
- **App-wide versioning**: All modules share one version timeline, never per-module v1.0.0.
- **Outline as source of truth**: Spec docs reflect current state (rewritten, not appended). Version docs preserve rationale.
- **No MCP during /s**: Local execution only. Context from plan files.
- **Cycles directory**: Structured working files at `cycles/[YYYY-WW]/[module]/[tier1-id]/[tier2-id]-slug.md` — organized by cycle, module, and tier 1 scope.
- **Intake tracking**: Intake items are identified by the INTAKE label and have a `## Tracking` checklist linking to T1(s). T1s created from intake items include an `Intake: [PROJ-N](url)` back-reference in their description. **Cardinality: Intake→T1 is 1:N, T1→Intake is N:1** — one intake can span multiple T1s, but each T1 references at most one intake. Never merge multiple intakes into one T1. `/pp` reads the T1 description to find the intake, ticks T1s on seal; when all are checked, intake → Done.
- **Intake types**: `/intake` requires explicit type — `in` (inquiry), `fe` (feature), `bu` (bug), `id` (idea). INQUIRY items are self-contained (no T1/T2); if work is discovered, a new BUG/FEATURE intake is created referencing the inquiry.
- **Knowledge system**: `/i` manages workspace-scoped intel files (todo, people, timeline, etc.). Todo items tagged with `(<ID>)` (e.g., `(PROJA-45)`) are tracked in Plane and resolved via intake completion check instead of manual check-off.
- **Unified config**: `config.json` has `workspaces` → `projects` structure. Both PA and standard consumers use the same file. PA-specific workspace fields (`folder`, `comms_mcp`, `detection_keywords`) are optional. Scripts accept `--workspace` and `--project` flags.
- **Product roadmaps** (optional): `/roadmap` creates a planning layer on Outline — parallel to Specifications (current state). Roadmaps live under `Roadmap/` with structure: `version/ → module/ → feature docs`. Checkboxes one level up: module doc tracks features, version doc tracks modules, roadmap root tracks versions. Features link to T1s via `Roadmap Feature:` in T1 descriptions (parallel to `Intake:` for reactive work). `/pp` cascades completion upward through the roadmap. Specs stay unchanged — roadmaps are additive.
- **QA persistence**: During `/pm BREAKDOWN` and `/p` planning, QA decisions (architectural choices, scope boundaries, rejected alternatives) are stored in the version module doc under `## Planning Decisions`. This prevents repeated questions when different agents work on sibling T2s or resume work later.
- **Two paths to T1**: T1s can originate from intake items (`Intake:` link) or roadmap features (`Roadmap Feature:` link). Both are valid, never both on the same T1. `/p` and `/pp` detect which path and follow the appropriate context/cascade logic.

## Changelog

**Every Bible change must create a changelog entry.** This is a Bible-specific rule (not cloned to consumers).

Format: `changelogs/YYYY-MM-DD_hh-mm-ss_Title.md` (UTC timestamps)

```markdown
# Title

**Date:** YYYY-MM-DD HH:MM UTC
**Scope:** [files changed]

## What Changed

[Description of changes]

## Why

[Rationale — what problem this solves]

## Migration

[Instructions for consumers to apply this change — what to update, what to re-sync]

## Before/After

[Old behavior → New behavior, if applicable]
```

## Sync Ledgers

Two consumer types exist, each syncing a different subset of files. `/bible-sync` auto-detects consumer type by checking if `.claude/commands/intake.md` or `.claude/commands/i.md` exists (PA consumer) vs not (standard consumer).

### Path Mapping

Commands in the Bible are organized under `pa/` and `project/` subfolders. Consumers place them at the **top level** of `.claude/commands/` so they register as flat commands (`/pm`, `/intake`) instead of nested (`project:pm`, `pa:intake`).

```
Bible source path                          → Consumer destination path
─────────────────────────────────────────────────────────────────────
.claude/commands/project/<cmd>.md          → .claude/commands/<cmd>.md
.claude/commands/pa/<cmd>.md               → .claude/commands/<cmd>.md
.claude/commands/shared/<cmd>.md           → .claude/commands/<cmd>.md
(all other files)                          → (same path)
```

**Not tracked** (consumer-specific, always different): `CLAUDE.md`, `package.json`, `.gitignore`. These are created by the consumer during adoption and never overwritten by sync.

### Standard Consumer (Project Codebase)

| Bible Source | Consumer Destination |
|---|---|
| `.claude/commands/project/pm.md` | `.claude/commands/pm.md` |
| `.claude/commands/project/p.md` | `.claude/commands/p.md` |
| `.claude/commands/project/s.md` | `.claude/commands/s.md` |
| `.claude/commands/project/pp.md` | `.claude/commands/pp.md` |
| `.claude/commands/project/rp.md` | `.claude/commands/rp.md` |
| `.claude/commands/project/triage.md` | `.claude/commands/triage.md` |
| `.claude/commands/project/gitpush.md` | `.claude/commands/gitpush.md` |
| `.claude/commands/project/load-skills.md` | `.claude/commands/load-skills.md` |
| `.claude/commands/shared/bible-sync.md` | `.claude/commands/bible-sync.md` |
| `.claude/skills/po/SKILL.md` | `.claude/skills/po/SKILL.md` |
| `scripts/config-get.js` | `scripts/config-get.js` |
| `scripts/lib/config.js` | `scripts/lib/config.js` |
| `scripts/lib/plane-parse-id.js` | `scripts/lib/plane-parse-id.js` |
| `scripts/plane-latest-version.js` | `scripts/plane-latest-version.js` |
| `scripts/plane-cycle-items.js` | `scripts/plane-cycle-items.js` |
| `scripts/plane-work-items.js` | `scripts/plane-work-items.js` |
| `scripts/plane-item-get.js` | `scripts/plane-item-get.js` |
| `scripts/plane-item-update.js` | `scripts/plane-item-update.js` |
| `scripts/plane-item-create.js` | `scripts/plane-item-create.js` |
| `scripts/plane-intake-get.js` | `scripts/plane-intake-get.js` |
| `scripts/plane-intake-update.js` | `scripts/plane-intake-update.js` |
| `scripts/plane-intake-handling.js` | `scripts/plane-intake-handling.js` |
| `scripts/outline-pull.js` | `scripts/outline-pull.js` |
| `scripts/outline-push.js` | `scripts/outline-push.js` |
| `scripts/outline-upload.js` | `scripts/outline-upload.js` |
| `docs/pm.md` | `docs/pm.md` |
| `docs/pm-workflow-guide.html` | `docs/pm-workflow-guide.html` |
| `config.json` | `config.json` |
| `.env.example` | `.env.example` |

### PA Consumer (Personal Assistant Codebase)

Includes everything from Standard Consumer, plus:

| Bible Source | Consumer Destination |
|---|---|
| `.claude/commands/pa/intake.md` | `.claude/commands/intake.md` |
| `.claude/commands/pa/i.md` | `.claude/commands/i.md` |
| `.claude/commands/pa/pi.md` | `.claude/commands/pi.md` |
| `.claude/commands/pa/roadmap.md` | `.claude/commands/roadmap.md` |

PA consumers do **not** sync `project/*` commands — they only get `pa/*` commands, `shared/*`, skills, scripts, and config files.

## File Reference

| File | Purpose |
|------|---------|
| `docs/pm.md` | Canonical PM workflow documentation |
| `docs/pm-workflow-guide.html` | Visual workflow guide |
| `.claude/skills/po/SKILL.md` | Project constants template (Plane + Outline) |
| `.claude/commands/pa/roadmap.md` | PA — product roadmap: create, plan versions, track progress, collect feedback |
| `.claude/commands/pa/intake.md` | PA — create or extend intake item with business context |
| `.claude/commands/pa/i.md` | PA — knowledge system: load intel, save intel, todo tracking |
| `.claude/commands/pa/pi.md` | PA — post-intake: task report on Outline, stakeholder announcement |
| `config.json` | Unified config with placeholder values (workspaces + projects, used by both PA and standard consumers) |
| `.claude/commands/project/triage.md` | Engineer — scope intake item against codebase |
| `.claude/commands/project/pm.md` | Manager — vision, breakdown, accept/triage/improve, catch-up |
| `.claude/commands/project/p.md` | Engineer — tier 2 → plan file |
| `.claude/commands/project/s.md` | Engineer — skills-aware task execution |
| `.claude/commands/project/pp.md` | Engineer — push tier 3+4, auto-condense specs |
| `.claude/commands/project/rp.md` | Reporter — cycle reports to Outline |
| `.claude/commands/project/gitpush.md` | Git — smart commit grouping |
| `.claude/commands/project/load-skills.md` | Discover and load project skills for convention context |
| `.claude/commands/shared/bible-sync.md` | Sync consumer codebase with Bible updates (consumers flatten to `.claude/commands/bible-sync.md`) |
| `scripts/config-get.js` | CLI entry point for config values — single key, multiple keys, JSON, or dump all |
| `scripts/lib/config.js` | Shared config resolver — workspace/project two-level resolution, env mapping |
| `scripts/lib/plane-parse-id.js` | Shared identifier parser — auto-detects UUID, PROJ-N, bare number |
| `scripts/lib/plane-api.js` | Shared Plane API utilities — paginated fetch, cycle/module reverse lookup |
| `scripts/plane-latest-version.js` | Get latest app-wide version from Plane (source of truth) |
| `scripts/plane-cycle-items.js` | Extract cycle data for reports |
| `scripts/plane-work-items.js` | Fetch work item sibling context |
| `scripts/plane-item-get.js` | Get work item — all fields + description |
| `scripts/plane-item-update.js` | Update work item — all PATCH fields + cycle/module |
| `scripts/plane-item-create.js` | Create work item with all fields + cycle/module assignment |
| `scripts/plane-intake-get.js` | Get intake item — fields + description |
| `scripts/plane-intake-update.js` | Update intake item — all PATCH fields |
| `scripts/plane-intake-handling.js` | Intake tracking checklist — add T1s, tick on seal, report status |
| `scripts/outline-pull.js` | Pull Outline doc to local .md for editing |
| `scripts/outline-push.js` | Push edited .md back to Outline |
| `scripts/outline-upload.js` | Upload file to Outline as attachment (images, videos) |
| `config.json` | Unified config with placeholder values (workspaces + projects) |
| `.env.example` | Example environment variables |
