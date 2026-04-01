Smart git commit and push workflow.

1. Run `git status` and `git diff` to review all changed files.
2. Group changes into logical commits:
   - New features (new files / major functionality)
   - Bug fixes (fixes, error handling)
   - Refactoring (code improvements, renames)
   - Styling (UI/CSS changes)
   - Config/dependencies (package.json, tsconfig, etc.)
   - Documentation (README, comments)
3. For each group:
   - Stage related files: `git add <files>`
   - Create a descriptive commit: `git commit -m "type(scope): clear description"`
   - Show what was committed
4. Push all commits: `git push origin <current-branch>`
5. Summarize what was pushed.

Commit format: `type(scope): description`
Types: feat, fix, refactor, style, chore, docs
Example: `feat(admin): add collapsible sidebar with shadcn components`
