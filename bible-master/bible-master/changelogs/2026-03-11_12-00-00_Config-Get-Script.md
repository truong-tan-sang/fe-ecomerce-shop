# Config Get Script

**Date:** 2026-03-11 12:00 UTC
**Scope:** `scripts/config-get.js`, `CLAUDE.md`, `.claude/skills/po/SKILL.md`

## What Changed

Added `scripts/config-get.js` — a CLI entry point for reading project configuration values from `config.json`. Wraps the existing `lib/config.js` loader with a simple command-line interface.

## Why

Agents repeatedly wrote ad-hoc `node -e "..."` one-liners to read config values (JSON.parse + fs.readFileSync), because no proper CLI script existed. This caused permission guard re-prompts (inline code patterns) and inconsistent config access. The new script provides a canonical way to get config values.

## Migration

1. Copy `scripts/config-get.js` from Bible to your project
2. Use `node scripts/config-get.js KEY_NAME` instead of ad-hoc JSON parsing
3. PO skill updated with `## Config Script` section documenting usage

## Before/After

Before: `node -e "const fs=require('fs'); const cfg=JSON.parse(fs.readFileSync('config.json','utf8')); ..."`
After: `node scripts/config-get.js PLANE_PROJECT_ID`
