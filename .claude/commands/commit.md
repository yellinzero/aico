---
description: Stage all changes and create a commit (no push)
allowed-tools:
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git add:*)
  - Bash(git commit:*)
  - Bash(git remote:*)
  - Bash(git branch:*)
  - Bash(git rev-parse:*)
  - Bash(git log:*)
---

Follow these steps in order:

1. Check whether you are inside a Git repository, and confirm the branch and working tree status:
   - Run `git rev-parse --is-inside-work-tree`
   - Run `git status -sb`

2. If the working tree has no changes (clean):
   - Tell the user "There are no changes to commit", and ask what to do next.

3. Generate a change summary (for crafting the commit message and confirming scope):
   - Run `git diff --name-status`
   - If more detail is needed, run `git diff`

4. Determine the current branch:
   - Run `git rev-parse --abbrev-ref HEAD`

5. Generate the commit message:
   - The commit message MUST follow the **Conventional Commits** specification:
     - Basic format: `<type>(<scope>): <subject>`
     - `scope` is optional; use present tense / imperative mood for `subject`, keep it concise, and avoid a trailing period.
   - Common `type`s (this repo is documentation/notes-heavy, so `docs` / `chore` are common):
     - `docs`: Documentation / notes / spec updates
     - `chore`: Tooling / config / scripts / workflow adjustments
     - `refactor`: Structural changes without changing external behavior (e.g. reorganize directories without semantic changes)
     - `fix`: Fix incorrect content / links / typos
     - `feat`: Add a usable capability (e.g. a new runnable command / new template)
   - Suggested `scope`: choose one main directory/topic impacted by the change: `life-os`, `docs`, `claude`, `output`, `news`, `tech`, `inspiration`.
   - If the user provides a custom message when running `/push`:
     - First validate it matches `^(feat|fix|docs|refactor|style|test|chore)(\([^)]+\))?(!)?: .+`
     - If it does not match: STOP and ask the user to confirm changing it to a compliant message.
   - If the user does NOT provide a message:
     - Based on the change summary from step 3, automatically generate a **single-line** Conventional Commit message (subject only)
     - Examples:
       - `docs(life-os): translate CLAUDE.local template into Chinese`
       - `chore(claude): update push command to commit-only mode`
       - `fix(docs): fix broken links in life-os reference docs`
   - The commit message must accurately reflect the intent of the changes; avoid vague words (e.g. `WIP` / `update` / `changes`).

6. Stage all changes:
   - Run `git add -A`
   - Run `git status -sb` again to confirm what is staged.

7. Create the commit:
   - Run `git commit -m "{message}"`
   - If you see "nothing to commit", there is nothing to commit: STOP and inform the user.

8. Finally output a short summary:
   - The commit message used
   - The main files/directories involved
   - Remind the user they can run `git push` manually to push to the remote
   - Ask what they want to do next
