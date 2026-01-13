---
description: Break down a story into frontend tasks with progress tracking
---

# /frontend.tasks - Task Breakdown

Break down a PM story into actionable frontend tasks with progress tracking.

## What This Command Does

1. Read specified story/version document
2. Read related design documents
3. Break down into frontend tasks
4. Create task list with progress tracking

## Prerequisites

- Story exists at `docs/reference/pm/stories/` or version at `docs/reference/pm/versions/`
- Design (optional) exists at `docs/reference/frontend/designs/`

## Workflow

```
/frontend.tasks [story name or path]
        │
        ▼
┌───────────────────────────────────┐
│ Read story/version document      │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Read related design (if exists)  │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Call aico-frontend-task-breakdown│
│ - Identify components            │
│ - Identify interactions          │
│ - Break into 1-2 hour tasks     │
│ - Order by dependencies          │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Output to tasks/[story].md       │
│ - Task list with status          │
│ - Acceptance criteria            │
│ - Dependencies noted             │
└───────────┴───────────────────────┘
```

## Usage

```bash
# Break down specific story
/frontend.tasks user-profile

# Break down from story path
/frontend.tasks docs/reference/pm/stories/user-profile.md

# Break down all stories in a version
/frontend.tasks v1.0.0
```

## Skills Used

- `aico-frontend-task-breakdown` - Break down story into frontend tasks

## Output Structure

```
docs/reference/frontend/tasks/
└── [story-name].md
```

## Task File Format

```markdown
# [Story Name] - Frontend Tasks

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
> Source: docs/reference/pm/stories/[story].md
> Design: docs/reference/frontend/designs/[name].md
> Status: pending | in_progress | completed

## Progress

| #   | Task                      | Status     | Notes |
| --- | ------------------------- | ---------- | ----- |
| 1   | Setup component structure | ⏳ pending |       |
| 2   | Implement header section  | ⏳ pending |       |
| 3   | Implement form section    | ⏳ pending |       |
| 4   | Add validation logic      | ⏳ pending |       |
| 5   | Integrate with API        | ⏳ pending |       |
| 6   | Write unit tests          | ⏳ pending |       |
| 7   | Write UI tests            | ⏳ pending |       |

## Tasks

### Task 1: Setup component structure

**Status**: ⏳ pending
**Goal**: Create component files with basic structure
**Scope**:

- Create `src/components/Profile/`
- Create `ProfilePage.tsx`, `ProfileForm.tsx`, `ProfileCard.tsx`
  **Acceptance Criteria**:
- [ ] Files created with TypeScript
- [ ] Basic component skeleton renders
- [ ] No TypeScript errors
      **Dependencies**: None

### Task 2: Implement header section

...
```

## Status Icons

| Icon | Status      | Meaning                |
| ---- | ----------- | ---------------------- |
| ⏳   | pending     | Not started            |
| 🔄   | in_progress | Currently working      |
| ✅   | completed   | Done and tested        |
| ❌   | blocked     | Waiting for dependency |

## Example

```bash
/frontend.tasks user-profile
```

Creates `docs/reference/frontend/tasks/user-profile.md` with:

- 7 tasks for implementing user profile feature
- Clear acceptance criteria for each
- Dependencies between tasks noted
- Progress tracking table

## Integration with Other Commands

After creating tasks, use:

1. `/frontend.plan [task-number]` - Create implementation plan for a task
2. Then execute using `aico-frontend-implement` skill
