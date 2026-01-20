---
description: Create atomic implementation plan for a frontend task
---

# /frontend.plan - Create Implementation Plan

Convert a single task into atomic implementation steps (2-5 minutes each).

## What This Command Does

1. Read the specified task from task list
2. Read related design and constraints
3. Create atomic step-by-step plan
4. Save plan to `docs/reference/frontend/plans/` directory
5. Each step has verification command
6. Present summary and next steps to user

## Prerequisites

- Task list exists at `docs/reference/frontend/tasks/[story].md`
- Design exists at `docs/reference/frontend/designs/`
- Constraints exist at `docs/reference/frontend/constraints.md`

## Workflow

```
/frontend.plan [story] [task-number]
        │
        ▼
┌───────────────────────────────────┐
│ Read task from tasks/[story].md  │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Read related design              │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Read constraints                 │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Call aico-frontend-plan skill    │
│ - Break into atomic steps        │
│ - Add verification for each      │
│ - Include exact code             │
│ - Save to plans/ directory       │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Present summary to user          │
│ - Plan file location             │
│ - Next steps for execution       │
└───────────┴───────────────────────┘
```

## Usage

```bash
# Plan specific task from story
/frontend.plan user-profile 2

# Plan task by name
/frontend.plan user-profile "Implement header section"

# Interactive: select from task list
/frontend.plan user-profile
```

## Skills Used

- `aico-frontend-plan` - Create atomic implementation plan

## Plan Output Format

````markdown
# Task: [Task Name] - Implementation Plan

> Project: [project-name]
> Created: YYYY-MM-DD
> Story: user-profile
> Task #: 2
> Estimated steps: 5

## Step 1: Create component file

**Files**:

- Create: `src/components/Profile/ProfileHeader.tsx`

**Action**:

```tsx
import React from 'react';

interface ProfileHeaderProps {
  name: string;
  avatarUrl: string;
}

export function ProfileHeader({ name, avatarUrl }: ProfileHeaderProps) {
  return null; // TODO
}
```
````

**Verify**:

```bash
npx tsc --noEmit
```

Expected: No errors

---

## Step 2: Implement avatar section

...

```

**Note**: The plan will be saved to `docs/reference/frontend/plans/{story}-task-{number}.md`

```

## Step Granularity

Each step = 2-5 minutes of work:

| Good                     | Bad                     |
| ------------------------ | ----------------------- |
| Create file with imports | Create entire component |
| Add component skeleton   | Implement all features  |
| Implement one section    | Implement all sections  |
| Write one test           | Write all tests         |

## After Planning

After the plan is created and saved:

1. **Review** - Review the saved plan file
2. **Confirm** - Confirm the approach is correct
3. **Execute** - Use `aico-frontend-implement` skill to execute step by step
4. **Verify** - Each step must pass verification before continuing
5. **Complete** - Update task status and commit when all steps done

## Example

```bash
/frontend.plan user-profile 2
```

Creates a plan file at `docs/reference/frontend/plans/user-profile-task-2.md` with:

- 5 atomic steps
- Exact code for each step
- Verification command for each
- Plan ready for review and execution
