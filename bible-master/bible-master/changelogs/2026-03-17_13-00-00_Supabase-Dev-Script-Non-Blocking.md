# Supabase Dev Script — Non-Blocking Fix

**Date:** 2026-03-17 13:00 UTC
**Scope:** `.claude/skills/bible-supabase-cli/SKILL.md`

## What Changed

- `supabase-dev.js` template changed from blocking (stays alive with SIGINT trap) to **non-blocking** (exits after start)
- Removed SIGINT/SIGTERM signal handlers and `setInterval` keepalive
- Updated description from 3 behaviors to 2 (removed "Stops on exit")
- Added explicit note: "The script must exit after start"

## Why

The original blocking script prevented `&&`-chained commands from running. Most projects use `node scripts/supabase-dev.js && concurrently ...` in their `dev` script — a blocking wrapper means edge functions, frontend dev server, and other services never start.

Supabase containers persist after `supabase start` exits — they don't need a parent process to stay alive. Stopping is done separately via `pnpm sb:dev:stop` / `supabase stop`.

## Migration

Re-sync consumers: `/bible-sync`. The updated skill template will auto-apply. Consumers who already scaffolded `supabase-dev.js` should remove the SIGINT handler and `setInterval` from their local copy.

## Before/After

- Before: `pnpm dev` starts Supabase and blocks — `concurrently` never runs
- After: `pnpm dev` starts Supabase, sets restart=no, exits — `concurrently` runs all services
