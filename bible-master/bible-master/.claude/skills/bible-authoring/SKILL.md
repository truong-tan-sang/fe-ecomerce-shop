---
name: bible-authoring
description: Use when converting existing skills into Bible-ready format or writing new Bible skills. NOT for consumer cloning.
---

# Bible Skill Authoring

Guidelines for writing skills that live in the Bible and sync to consumer codebases.

## Bible Structure

```
bible.git/
├── chapters/
│   ├── pm/                                    ← Chapter 1: PM Workflow (existing)
│   │   ├── commands/, scripts/, docs/, config/
│   │   └── skills/po/SKILL.md
│   └── skills/                                ← Chapter 2: Skills Library
│       ├── catalog.json                       ← Index of all skills + categories
│       ├── bible-project-structure/SKILL.md
│       ├── bible-react-naming/SKILL.md
│       ├── bible-tanstack-store/SKILL.md
│       └── ...
├── CLAUDE.md
```

## Naming Convention

Every Bible skill folder: `bible-{category}-{name}`

The `bible-` prefix is the **canonical name** — same in Bible repo AND consumer:

```
# Bible repo                        # Consumer
chapters/skills/                     .claude/skills/
├── bible-react-naming/              ├── bible-react-naming/       ← synced
├── bible-tanstack-store/            ├── bible-tanstack-store/     ← synced
                                     ├── figma-implementation/     ← local (no prefix)
```

The prefix signals: "This skill is Bible-managed. Edit locally to test, but sync changes back to Bible."

Categories: `project`, `react`, `tanstack`, `antd-v6`, `supabase`, `pnpm`, `env`, `meta`

## Core Principles

### 1. Domain Isolation — No Cross-Contamination

Each skill covers ONE domain. Never mix:

| Wrong | Right |
|---|---|
| TanStack query hook with Supabase `queryFn` body | TanStack skill: hook structure only. Supabase skill: "Usage with TanStack Query" section |
| TanStack router guard with `supabase.auth.getSession()` | Router skill: abstract guard pattern. Auth skill: session implementation |
| Mutation hook with ANTD `message.error()` | Mutation skill: abstract error handling. ANTD skill: feedback patterns |

**Why:** A consumer using TanStack + Prisma (no Supabase) should still adopt `bible-tanstack-query-mutation` without irrelevant Supabase patterns.

When a pattern spans two domains, each skill covers its own side:
- TanStack skill shows the hook structure with `// Data layer — see your backend skill` placeholder
- Supabase skill shows "With TanStack Query, your queryFn looks like..."
- Neither imports or requires the other

### 2. Each Skill Owns Its Own Paths

A skill that references directory structure must define it within itself, not point to `bible-project-structure`.

- `bible-react-naming` defines `src/pages/`, `src/stores/`, etc.
- `bible-supabase-edge-functions` defines function directory conventions
`bible-project-structure` only knows the monorepo root skeleton (where `frontend/`, `cloudflare/`, `backend/` live).

### 3. Agnostic Examples

Replace project-specific references with generic ones:

| Project-specific | Bible generic |
|---|---|
| `Page_Organization`, `PageProjectShot` | `Page_Dashboard`, `Page_Project` |
| `Provider_Spark_FileBrowserModal` | `Provider_App_FilePickerModal` |
| `spark/frontend/my-vite-app/` | `frontend/vite/` |
| `Store_PageProduction` | `Store_PageDashboard` |
| Specific channel IDs, file paths | Removed or placeholder |

### 4. Default Values with Confirmation

When a value varies per project, use a sensible default that the onboarding confirms:

| Decision | Default | Onboarding asks |
|---|---|---|
| Custom component prefix | `App_` | "What's your component prefix? (default: App)" |
| Import alias | `@/` | Confirm |
| Frontend app folder | `vite` | Confirm |

Do NOT use `${PLACEHOLDER}` variables in skills (that's for PO skill in PM chapter only). Instead, write the skill with the default value, and the onboarding process replaces it.

### 5. Onboarding Checklist Per Skill Group

Each skill group has an onboarding section in `skill-onboarding.md` (consumer-side). Format:

```markdown
## {category}

### Decisions
- [x] Custom component prefix: Spark (default: App)
- [x] Import alias: @/ (confirmed default)

### Scaffolding
- [x] Created QueryKeys factory at src/utils/query/queryKeys.ts
- [x] Created AtLeastOne utility type at src/types/utility.types.ts
```

**Decisions** = text replacements in SKILL.md files (prefix names, paths)
**Scaffolding** = files the onboarding agent creates from templates (QueryKeys factory, utility types, migration files like `generate_id()`)

### 6. Scaffolding Instructions in Skill

If a skill requires setup artifacts (not just conventions), include a `## Onboarding` section at the bottom:

```markdown
## Onboarding

### Decisions
- Custom component prefix (default: `App_`)

### Scaffolding
Create QueryKeys factory:
- Path: `src/utils/query/queryKeys.ts`
- Template:
  ```typescript
  // QueryKeys factory — add tables as your project grows
  export const QueryKeys = {
    // example: { all: () => ["example"], list: () => [...QueryKeys.example.all(), "list"], record: (id: string) => [...QueryKeys.example.all(), id] },
  };
  ```
```

The onboarding agent reads this section and executes it.

## Monorepo Standard (Flat)

Bible standard is flat — no project wrapper folder:

```
repo-root/
├── .claude/                ← Bible + skills
├── scripts/                ← PM scripts
├── docs/                   ← Documentation
├── cycles/                 ← Plan files
├── frontend/               ← React workspaces
│   └── vite/
├── cloudflare/             ← CF Workers
│   └── workers/
├── backend/                ← Backend services
├── desktop/                ← Desktop (if applicable)
├── pnpm-workspace.yaml
└── package.json
```

## Cross-Project Standard Conventions

These prefixes are enforced across ALL consumer projects (not onboarding decisions):

| Prefix | Entity | Variable |
|---|---|---|
| `Page_*` | Page components | — |
| `Page[Name]_*` | Page subcomponents | — |
| `useQ_*` | Query hooks | `q*` |
| `useM_*` | Mutation hooks | `m*` |
| `Provider_*` | Context providers | `p*` |
| `useProvider_*` | Provider consumer hooks | `p*` |
| `Store_*` | TanStack stores | — |
| `useStore_*` | Store selectors | — |
| `service_*` | Singleton services | `s*` |
| `const_*` | Constants files/exports | — |
| `UI_*` | Pure reusable components | — |
| `Utils_*` | Global utilities | — |
| `utils_*` | Domain-scoped utilities | — |
| `useHotkeys_*` | Hotkey hooks | — |

The only prefix that varies per project: the custom **shared component prefix** (default `App_`, e.g., `App_Modal`, `Spark_Switch`).

## Sync Flow

### Bible → Consumer (adopting)
1. `/bible-sync` reads `chapters/skills/catalog.json`
2. Shows available skills grouped by category
3. Consumer picks which to adopt (per-skill)
4. Adopted skills copied to `.claude/skills/bible-{name}/`
5. Onboarding agent runs `## Onboarding` section for each adopted skill
6. Decisions recorded in `.claude/skill-onboarding.md`

### Consumer → Bible (gap found)
1. Engineer finds gap, writes/edits skill locally (even `bible-` prefixed)
2. Tests locally
3. Generalizes (remove project-specific examples)
4. PRs to Bible repo
5. Other consumers pick up on next `/bible-sync`

### Re-sync
1. `/bible-sync` checks adopted `bible-*` skills against Bible versions
2. Auto-updates unchanged skills
3. Flags diverged skills for review
4. Re-applies onboarding decisions from `skill-onboarding.md` after update

## Writing Checklist

When converting an existing skill to Bible-ready:

- [ ] Folder named `bible-{category}-{name}`
- [ ] No cross-domain contamination (Supabase out of TanStack, ANTD out of mutations, etc.)
- [ ] All examples use generic names (no project-specific components/pages)
- [ ] Custom component prefix uses `App_` default
- [ ] Paths use `frontend/vite/` monorepo standard
- [ ] `@/` import alias used (default)
- [ ] Skill owns its own directory paths (doesn't reference other skills for "where")
- [ ] `## Onboarding` section if decisions or scaffolding needed
- [ ] No nav height or other layout-specific pixel values (teach patterns, not numbers)
- [ ] Cross-skill references are soft: "See your {domain} skill" not "See bible-supabase-sdk"
