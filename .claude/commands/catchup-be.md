Sync frontend context with latest backend changes.

Backend repo: `C:\Users\LEGION\Downloads\DACN\be-ecomerce-shop` (READ ONLY — do not edit)

## Steps

1. **Check what changed** — run `git log --oneline -20` and `git diff HEAD~5 --stat` in the BE repo to see recent commits and changed files.

2. **Read changed controllers/entities** — for any modified controller, DTO, or entity files, read them to understand new/changed endpoints.

3. **Compare against cached snapshot** — read the memory file at `C:\Users\LEGION\.claude\projects\C--Users-LEGION-Downloads-DACN-fe-ecomerce-shop\memory\reference_be_api_surface.md` and identify what's new or different.

4. **Report changes** — summarize:
   - New endpoints added
   - Changed request/response shapes
   - New entities or fields
   - Removed or deprecated endpoints
   - Any breaking changes that affect the frontend

5. **Update the cache** — update the memory file `reference_be_api_surface.md` with the new information and bump the "Last synced" date.

6. **Flag FE impact** — if any changes affect existing frontend code (e.g. renamed fields, new required params, removed endpoints), list the specific FE files that need updating.

$ARGUMENTS — optional: pass a specific area like "payments" or "orders" to only check that module
