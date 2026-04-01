# Remove Redundant Scripts

**Date:** 2026-03-05 11:00 UTC
**Scope:** `scripts/`, `package.json`, `CLAUDE.md`, `.claude/commands/project/triage.md`, `.claude/skills/po/SKILL.md`, `.claude/commands/shared/bible-sync.md`

## What Changed

- **Deleted `scripts/plane-desc-append.js`** — `/triage` now uses the standard pull→edit→push workflow (`plane-intake-get.js` → Edit → `plane-intake-update.js --desc`)
- **Deleted `scripts/setup-po.js`** — agent fills `${PLACEHOLDER}` in SKILL.md directly by reading `project-config.json`
- **Deleted `scripts/generate-mcp.js`** — agent writes `.mcp.json` directly by reading config + `.env`
- **Emptied `package.json` scripts** — no npm aliases needed; agents call scripts by path
- **Removed `dotenv` devDependency** — no remaining scripts use it
- Updated all references: CLAUDE.md adoption instructions, PO skill script table, bible-sync tracked file list, triage command Step 6

## Why

All three scripts duplicate what the agent already does natively:
- `plane-desc-append.js` was a specialized section-merge tool, but the agent can edit HTML files directly via the Edit tool. The intake get/update scripts already handle the pull/push.
- `setup-po.js` did find-and-replace on `${PLACEHOLDER}` patterns — trivial for an agent reading a JSON config.
- `generate-mcp.js` wrote a JSON file from config values — trivial for an agent.

The Bible assumes all consumers use a Claude agent. Agent-native file operations are simpler and more transparent than intermediary scripts.

## Migration

### Consumers using `plane-desc-append.js`
- Delete `scripts/plane-desc-append.js`
- Update `/triage` command: use `plane-intake-get.js` → Edit → `plane-intake-update.js --desc` instead

### Consumers using `setup-po.js` or `generate-mcp.js`
- Delete both scripts
- Agent fills SKILL.md placeholders and writes `.mcp.json` directly during setup

### package.json
- Remove all npm script aliases
- Remove `dotenv` from devDependencies if no other scripts use it

## Before/After

- Before: 3 utility scripts + 4 npm aliases + dotenv dependency
- After: 0 utility scripts, 0 npm aliases, 0 unnecessary dependencies. Agent handles setup directly.
