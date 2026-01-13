---
description: Create atomic implementation plan for a backend task
---

# Create Implementation Plan

Convert a single backend task into atomic 2-5 minute implementation steps.

## Usage

```
/backend.plan [task-number]
```

## Arguments

- `task-number` (optional): Task number from the task list
  - If not provided, show current task list and ask user to select

## Prerequisites

- Task file exists at `docs/reference/backend/tasks/[story].md`
- Constraints file exists at `docs/reference/backend/constraints.md`

## Steps

1. **Locate task**
   - Read task file from `docs/reference/backend/tasks/`
   - If task-number provided, find that task
   - If not provided, show pending tasks for selection

2. **Read constraints**
   - Load `docs/reference/backend/constraints.md`
   - Understand tech stack, patterns, conventions

3. **Invoke plan skill**
   - Use `aico-backend-plan` skill
   - Break task into atomic steps (2-5 minutes each)
   - Each step includes:
     - Files to create/modify
     - Exact action to take
     - Verification command

4. **Present plan**
   - Show step-by-step implementation plan
   - Include TDD steps (test first)
   - Include verification for each step

## Output

```markdown
# [Task Name] - Implementation Plan

> Project: [project-name]
> Created: YYYY-MM-DD
> Task: [task description]

## Step 1: Define types

**Files**: Create `src/types/user.ts`
**Action**: [code snippet]
**Verify**: `npx tsc --noEmit` → No errors

## Step 2: Write failing test

**Files**: Create `src/services/__tests__/user.test.ts`
**Action**: [test code]
**Verify**: `npm test user.test.ts` → 1 failing test

...

Ready to implement? Use the implement skill to execute this plan.
```
