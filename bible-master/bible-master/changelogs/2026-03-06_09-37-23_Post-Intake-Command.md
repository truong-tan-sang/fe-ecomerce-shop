# Post-Intake Command (`/pi`) + Post-Completion Pipeline

**Date:** 2026-03-06 09:37 UTC
**Scope:** `.claude/commands/pa/pi.md` (new), `config.example.json`, `.claude/skills/po/SKILL.md`, `CLAUDE.md`, `docs/pm.md`

## What Changed

Added the `/pi` (post-intake) command and four new post-completion states to the PM pipeline.

**New command:** `/pi <plane-item-link>` — PA command for PMs. After an engineer's work is marked Done via `/pp`, the PM runs `/pi` to:
1. Gather full context (T1, T2s, intake, version doc, spec doc)
2. Create/update a Task Report on Outline (under new `Task Reports/` folder)
3. Prompt PM to paste screenshots/evidence
4. Send announcement email to stakeholders via workspace comms MCP
5. Move item to Announced state

**New states (all in `completed` group):**

| State | Purpose | Managed by |
|-------|---------|------------|
| Passed | PM confirmed QA pass | Manual |
| Announced | Stakeholders notified, in feedback window | `/pi` command |
| Approved | Stakeholder acknowledged, ready to deploy | Manual |
| Deployed | Live in production | Manual |

**Pipeline:** `Done → Passed → Announced → Approved → Deployed`

Passed and Approved are optional manual PM milestones. `/pi` can shortcut from Done directly to Announced.

**New config values:**
- `STATE_PASSED_UUID`, `STATE_ANNOUNCED_UUID`, `STATE_APPROVED_UUID`, `STATE_DEPLOYED_UUID`
- `OUTLINE_TASK_REPORTS_DOC_ID`

## Why

The existing pipeline ended at "Done" — there was no tracking for PM sign-off, stakeholder notification, approval, or deployment. PMs had no command to formally close the loop between engineering completion and production deployment. This created gaps where:
- Completed features sat unannounced
- Stakeholders weren't notified of delivered work
- Deployment status was untracked
- No documentation existed for what was delivered

## Migration

1. **Create 4 new Plane states** in each project (all `completed` group):
   - Passed, Announced, Approved, Deployed
   - Recommended color gradient (light→dark): `#d9f7be`, `#95de64`, `#52c41a`, `#237804`, `#092b00` for Done→Passed→Announced→Approved→Deployed
   - Use `list_states` + `create_state` MCP tools, or create manually in Plane UI

2. **Update `config.json`** per project — add UUIDs for new states:
   ```json
   "STATE_PASSED_UUID": "<uuid>",
   "STATE_ANNOUNCED_UUID": "<uuid>",
   "STATE_APPROVED_UUID": "<uuid>",
   "STATE_DEPLOYED_UUID": "<uuid>"
   ```

3. **Add Outline Task Reports folder** — create a doc under the project root called "Task Reports" and add its ID:
   ```json
   "OUTLINE_TASK_REPORTS_DOC_ID": "<uuid>"
   ```

4. **Run `/bible-sync`** to pull updated files:
   - PA consumers: picks up new `pi.md` command + all updated files
   - Standard consumers: picks up updated `po` skill, config, docs (no `pi.md` — PA only)

5. **Update PO skill** — re-run placeholder fill to populate new state UUIDs and Task Reports doc ID

## Before/After

**Before:** Pipeline ended at Done. No PM sign-off, no stakeholder notification, no deployment tracking.

**After:** Full post-completion pipeline: Done → Passed → Announced → Approved → Deployed. `/pi` automates the announcement step with Outline task reports and stakeholder emails. Manual milestones (Passed, Approved, Deployed) give PMs clear checkpoints.
