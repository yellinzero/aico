---
name: aico-frontend-task-breakdown
description: |
  Break down PM story into frontend tasks following UI DEVELOPMENT order: Setup → Static UI → Dynamic Logic → Interactions → Testing.

  UNIQUE VALUE: Ensures proper dependency order. Tasks are ordered by UI development layers, not random order.

  Use this skill when:
  - Running /frontend.tasks command
  - User asks to "break down story", "create frontend tasks", "split into tasks"
  - Have story at docs/reference/pm/stories/ and need organized task list
  - Need tasks ordered by UI development layers (not random order)
  - Starting frontend work and want organized task list

  Task order is CRITICAL: Setup → Static UI → Dynamic → Interactions → Tests
  Output: ALWAYS write to docs/reference/frontend/tasks/{story-name}.md
---

# Task Breakdown

## ⚠️ CRITICAL RULES - READ FIRST

**BEFORE doing anything, you MUST:**

1. **CHECK EXISTING TASKS FIRST**:
   - ALWAYS check if `docs/reference/frontend/tasks/{story-name}.md` already exists
   - If exists: READ it and continue from current progress
   - If not exists: Create new task breakdown
   - **NEVER re-break down existing tasks**

2. **UPDATE PROGRESS TABLE**:
   - When completing a task, ALWAYS update the Progress table
   - Mark task status: ⏳ pending → 🔄 in_progress → ✅ completed
   - Update the "Last Updated" date

3. **MARK ACCEPTANCE CRITERIA AS COMPLETED**:
   - When a task is done, check ALL acceptance criteria
   - Change `- [ ]` to `- [x]` for each completed criterion
   - Only mark task as ✅ completed when ALL criteria are checked
   - Example: `- [ ] Criterion 1` → `- [x] Criterion 1`

4. **ALWAYS SAVE TO CORRECT PATH**:
   - Path: `docs/reference/frontend/tasks/{story-name}.md`
   - NO exceptions, NO other locations

5. **READ CONTEXT FIRST**:
   - Read story from `docs/reference/pm/stories/`
   - Read design from `docs/reference/frontend/designs/` if exists
   - Read design system from `docs/reference/frontend/design-system.md`
   - Read constraints from `docs/reference/frontend/constraints.md`

## Language Configuration

Before generating any content, check `aico.json` in project root for `language` field to determine the output language. If not set, default to English.

## Process

1. **Read story/PRD**: Load from `docs/reference/pm/stories/` or `docs/reference/pm/versions/`
2. **Read design** (if exists): Load from `docs/reference/frontend/designs/`
3. **Identify components**: What UI elements are needed
4. **Identify interactions**: What logic and events are needed
5. **Break into tasks**: Independently testable, single responsibility
6. **Order by dependencies**: Setup → Static UI → Dynamic → Tests
7. **Save output**: ALWAYS write to `docs/reference/frontend/tasks/{story-name}.md`

## Task File Template

```markdown
# [Story Name] - Frontend Tasks

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
> Source: docs/reference/pm/stories/[story].md
> Design: docs/reference/frontend/designs/[name].md
> Status: in_progress

## Progress

| Task                         | Status         | Notes |
| ---------------------------- | -------------- | ----- |
| 1. Setup component structure | ✅ completed   |       |
| 2. Implement header section  | 🔄 in_progress |       |
| 3. Implement content section | ⏳ pending     |       |

## Tasks

### Task 1: [Task Name]

**Status**: ⏳ pending
**Goal**: What this task achieves
**Scope**: Files to create/modify
**Acceptance Criteria**:

- [ ] Criterion 1
- [ ] Criterion 2
      **Dependencies**: Task X (if any)
```

## Task Types

| Type        | Examples                                |
| ----------- | --------------------------------------- |
| Setup       | Create component structure, setup state |
| UI          | Implement section/component layout      |
| Logic       | Add form validation, API integration    |
| Interaction | Implement hover, click, animations      |
| Testing     | Unit tests, integration tests           |

## Granularity Rules

- Each task = independently testable
- Each task = single responsibility
- Each task = clear scope (not too big, not too small)

## Ordering Rules

1. Setup tasks first
2. Static UI before dynamic
3. Core functionality before edge cases
4. Tests after implementation

## Key Rules

- ALWAYS include test tasks at the end
- MUST note dependencies between tasks
- ALWAYS save to `docs/reference/frontend/tasks/` directory
- Keep tasks focused - not too big, not too small

## Common Mistakes

- ❌ Tasks too large (full page) → ✅ Break into sections
- ❌ Tasks too small (add one button) → ✅ Group related work
- ❌ Skip dependencies → ✅ Note which tasks depend on others
- ❌ Forget testing → ✅ Always include test tasks
