# Supabase Docker Lifecycle Management

**Date:** 2026-03-17 12:00 UTC
**Scope:** `.claude/skills/bible-supabase-cli/SKILL.md`, `.claude/skills/bible-project-structure/SKILL.md`

## What Changed

### bible-supabase-cli
- Added **Docker Lifecycle Management** section with full `supabase-dev.js` wrapper template
- Documents the restart policy problem, container naming convention, and clean shutdown pattern
- Scaffolding now creates `scripts/supabase-dev.js` and sets `project_id` during onboarding

### bible-project-structure
- Moved Supabase from root-level to inside `frontend/vite/supabase/` in the standard layout
- Added **Supabase Location** section explaining why colocating with frontend is the default
- Removed "root or inside frontend" ambiguity from onboarding decisions

## Why

Multiple codebases with Supabase each spawn Docker containers with `restart: always`. When Docker Desktop starts, all stacks auto-start — heavy resource usage, port conflicts, and containers named generically (e.g., `supabase_db_vite`) that are indistinguishable across projects.

Additionally, placing `supabase/` at root breaks the type generation workflow — `supabase gen types` output needs to land in `src/types/database.types.ts` which requires awkward relative paths from root.

## Migration

1. **Existing projects using root-level supabase:** Move `supabase/` into `frontend/vite/` and update pnpm scripts accordingly
2. **All projects:** Run `/bible-sync` to get the updated skills, then adopt the scaffolding:
   - Set `project_id` in `config.toml` to your repo name
   - Create `scripts/supabase-dev.js` from the skill template
   - Update `sb:dev:start` in `package.json` to use the wrapper

## Before/After

- Before: `docker ps` shows `supabase_db_vite` (unknown project, auto-restarts)
- After: `docker ps` shows `supabase_db_my-app` (identifiable, only runs when `pnpm dev` is active)
