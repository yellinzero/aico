---
description: Sync with the latest project state and summarize progress
allowed-tools: Bash(git diff:*), Read, Grep
---

Perform these steps in order:

1. Run `git diff --name-only main...HEAD` to list the changed files.
2. Read each file to understand the context of the edits.
3. Summarize the most important changes and their intent.
4. Ask the user what they would like to tackle next.
