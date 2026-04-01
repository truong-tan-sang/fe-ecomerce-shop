# Config JSON — Committed and Synced

**Date:** 2026-03-19 12:00 UTC
**Scope:** config.example.json → config.json, .gitignore, CLAUDE.md, bible-sync.md, scripts/lib/config.js

## What Changed

- Renamed `config.example.json` to `config.json` — now a committed, synced file instead of a gitignored copy
- Removed `config.json` from `.gitignore`
- Updated `CLAUDE.md`: removed `cp config.example.json config.json` adoption steps, updated sync ledgers and file references
- Updated `bible-sync.md`: tracked file changed from `config.example.json` to `config.json`, removed `config.json` from "never synced" exclusion list, added special file handling for `config.json` (always `diverged` once filled)
- Updated `scripts/lib/config.js`: error message no longer references `config.example.json`

## Why

`config.json` contains project-level constants (Plane workspace slugs, project IDs, state UUIDs, Outline doc IDs) — values that are the same for every engineer working on a given project. Only the `.env` file (API keys) is truly per-engineer. Having `config.json` gitignored forced every new team member to manually set it up, which was unnecessary friction. The `.example` → actual copy pattern made sense in the Bible (template used across many projects) but not within a single consumer codebase.

## Migration

### Standard and PA consumers

1. Run `/bible-sync` — this will:
   - Flag `config.example.json` as deleted from Bible
   - Offer `config.json` as a new tracked file
2. If you already have a filled `config.json`:
   - Accept the new tracked file — it will show as `diverged` (your values differ from placeholders)
   - Remove `config.json` from your `.gitignore`
   - Commit `config.json` to your repo
3. If you don't have `config.json` yet:
   - Accept the new tracked file (placeholder version)
   - Fill it with your project values
   - Remove `config.json` from `.gitignore`
   - Commit it
4. Delete `config.example.json` from your repo (it no longer exists in the Bible)

## Before/After

Before: `config.example.json` (committed template) + `config.json` (gitignored, per-setup copy)
After: `config.json` (committed, synced as `diverged` once filled with project values)
