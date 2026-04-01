# PP Media Count Syntax & MM Clock Floor Fix

**Date:** 2026-03-27 10:00 UTC
**Scope:** `.claude/commands/project/pp.md`

## What Changed

1. **Media count syntax** — `re`/`sc` tokens now support a count prefix or suffix: `2re`, `re3`, `sc2`, `3sc`. Count on one side only; dual-count (`2re5`) is rejected. No number defaults to 1.
2. **MM semantics fixed** — MM is now correctly documented as a clock minute floor (minute-of-the-hour), not a duration. If MM > current minute, the previous hour is used. Example: at 17:08, `MM=50` means >= 16:50.
3. **Multi-file upload** — with count > 1, multiple files are sorted by timestamp descending and the N latest are taken and uploaded individually.
4. **No-space concatenation** — media tokens are concatenated (`2re`, `sc3`), not space-separated (`re 5`).
5. **MM is standalone** — a bare number token (not attached to `re`/`sc`) is the minute mark.

## Why

- Previous docs described MM as a duration ("within the last MM minutes"), which was incorrect. The intent was always a clock minute floor to prevent picking up media from a different PP session that happened to be recent.
- Count > 1 supports uploading multiple recordings/screenshots for a single feature push.
- Concatenated syntax is more compact and unambiguous.

## Migration

Run `/bible-sync` to pull the updated `pp.md`. No script or config changes needed — this is a command-only change.

## Before/After

**Before (v3.2):**
```
/pp plan re 5              → 1 latest recording within last 5 minutes (duration)
/pp plan re 5 sc 10        → 1 recording (5 min) + 1 screenshot (10 min)
```

**After (v3.3):**
```
/pp plan re                → 1 latest recording (no time filter)
/pp plan 5 2re             → 2 latest recordings not older than :05 (clock floor)
/pp plan 10 re2 3sc        → 2 recordings + 3 screenshots not older than :10
```
