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

4. **Save plan to file**
   - Save to `docs/reference/backend/plans/{story}-task-{number}.md`
   - Present summary and next steps to user

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

**Note**: The plan is saved to `docs/reference/backend/plans/{story}-task-{number}.md`

Ready to implement? Review the plan file, then use the `aico-backend-implement` skill to execute this plan.
```
