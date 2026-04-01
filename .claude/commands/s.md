---
name: /s
description: Task execution — implement from plan file, local only
---

# Task Execution Command (Local)

Execute a task following the plan file. **No external calls. Plan file for context.**

**Cycle:** `/pm` (plan features) → `/p` (plan implementation) → `/s` (execute) → `/pp` (push + condense)

---

## Input

```
/s [task description]                            → Standalone execution
/s [plan file path]                              → Execute next unchecked phase/task
/s [plan file path] [phase] [task description]   → Execute specific phase/task
```

---

## Standalone Mode

When no plan file is referenced — just execute the task directly. Read existing code first, understand patterns, then implement.

---

## Plan-File-Guided Mode

When input references a plan file (`cycles/**/*.md`):

### Pre-Execution

1. **Read plan file** — understand feature context (Context section: non-tech, tech, related)
2. **Read module spec** — `docs/specs/{module}.md` for current patterns and architecture
3. **Identify target** — specific phase/task from input, or infer next unchecked item
4. **Read relevant existing code** — files mentioned in the Tech context line
5. **Check BE API surface** — if task involves API calls or services, read `C:\Users\LEGION\.claude\projects\C--Users-LEGION-Downloads-DACN-fe-ecomerce-shop\memory\reference_be_api_surface.md` to verify endpoint paths, HTTP methods, required roles, and request/response shapes before writing service code

### Execution

6. **Implement the task** applying project conventions from `CLAUDE.md`:
   - Strict typing via DTOs from `openapi.json`
   - `sendRequest<IBackendRes<T>>()` for services
   - `cursor-pointer` on all clickable elements
   - shadcn/ui components for admin pages
   - Logging format: `console.log("[ComponentName] message:", data)`

7. **Run `npx tsc --noEmit`** after changes — fix any type errors

### Post-Execution

8. **Update plan file** — mark completed tasks `[x]`
9. **If entire phase complete** — note it in output

### Output

```
Implemented: [phase/task description]
Plan updated: [path] | Phase [X]: [N]/[M] tasks done
tsc: [pass/fail]
```

---

## Critical Rules

1. **Read existing code first** — understand patterns before changing anything
2. **Follow CLAUDE.md conventions** — strict types, no `any`, proper logging
3. **Run tsc after changes** — fix all type errors before reporting done
4. **Update checkboxes locally** — mark `[x]` after implementing each task
5. **One task at a time** — don't implement multiple tasks in a single run unless they're trivially related
6. **Context from plan file** — don't guess requirements, read the plan
