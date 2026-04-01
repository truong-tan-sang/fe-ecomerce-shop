# Media Upload for /pp and /rp

**Date:** 2026-03-20 16:00 UTC
**Scope:** scripts/outline-upload.js (new), .claude/commands/project/pp.md, .claude/commands/project/rp.md, .claude/skills/po/SKILL.md, .env.example, CLAUDE.md

## What Changed

- **New script:** `outline-upload.js` — uploads files to Outline via `attachments.create` API. Two-step flow (create attachment record → upload to provided URL). Auto-detects video dimensions via `ffprobe` for Outline's inline video player (requires `WxH` in link text).
- **`/pp` v3.1:** Added optional `re MM` and `sc MM` arguments for recording/screenshot upload. New "Media Collection" step finds latest file within a time window from `BIBLE_RECORDINGS_DIR`/`BIBLE_SCREENSHOTS_DIR` env vars. Media is embedded in the version doc under each T2's `### Media` section.
- **`/rp` v1.2:** Step 2 now reads version docs for `### Media` sections. Attachment URLs are inlined under each feature in "What Was Delivered". Same URLs work across docs — no re-uploading needed.
- **PO SKILL.md:** Added `outline-upload.js` documentation section.
- **`.env.example`:** Added `BIBLE_RECORDINGS_DIR` and `BIBLE_SCREENSHOTS_DIR`.
- **Sync ledgers:** Added `scripts/outline-upload.js` to tracked files.

## Why

Engineers recording demos or capturing screenshots during development had no way to attach media to the PM workflow. Media was uploaded manually or lost. This integrates media capture into the existing `/pp` → `/rp` pipeline so recordings and screenshots flow automatically from version docs into cycle reports.

## Migration

1. **Re-sync** (`/bible-sync`) to get `outline-upload.js`, updated `pp.md`, `rp.md`, and PO SKILL.
2. **Add env vars** to `.env`:
   ```
   BIBLE_RECORDINGS_DIR=/path/to/screen/recordings
   BIBLE_SCREENSHOTS_DIR=/path/to/screenshots
   ```
   If omitted, `/pp` without `re`/`sc` args works exactly as before.
3. **ffprobe required** for video dimension detection (optional — videos still upload without it, just no inline player).

## Before/After

- **Before:** `/pp plan-file` — text only, no media
- **After:** `/pp plan-file re 30 sc 30` — uploads latest recording + screenshot from last 30 minutes to version doc, grouped by T2. `/rp` pulls those URLs into the cycle report automatically.
