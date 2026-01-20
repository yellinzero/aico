---
name: aico-backend-task-breakdown
description: |
  Break down PM story into backend tasks following LAYERED ARCHITECTURE order: Data Models → Database → Repository → Service → API → Validation → Tests.

  UNIQUE VALUE: Ensures proper dependency order and separation of concerns. Tasks are ordered by architectural layers, not random order.

  Use this skill when:
  - Running /backend.tasks command
  - User asks to "break down story for backend", "create backend tasks", "split into backend tasks"
  - Have story at docs/reference/pm/stories/ and need organized task list
  - Need tasks ordered by architectural layers (not random order)
  - Starting backend work and want organized, layered task list

  Layer order is CRITICAL: Types/Entities → Migrations → Repository → Service → API → Validation → Tests
  Output: ALWAYS write to docs/reference/backend/tasks/{story-name}.md
---

# Task Breakdown

## ⚠️ CRITICAL RULES - READ FIRST

**BEFORE doing anything, you MUST:**

1. **CHECK EXISTING TASKS FIRST**:
   - ALWAYS check if `docs/reference/backend/tasks/{story-name}.md` already exists
   - If exists: READ it and continue from current progress
   - If not exists: Create new task breakdown
   - **NEVER re-break down existing tasks**

2. **UPDATE PROGRESS TABLE**:
   - When completing a task, ALWAYS update the Progress table
   - Mark task status: ⏳ pending → 🔄 in_progress → ✅ completed

3. **MARK ACCEPTANCE CRITERIA AS COMPLETED**:
   - When a task is done, check ALL acceptance criteria
   - Change `- [ ]` to `- [x]` for each completed criterion
   - Only mark task as ✅ completed when ALL criteria are checked
   - Example: `- [ ] Criterion 1` → `- [x] Criterion 1`

4. **ALWAYS SAVE TO CORRECT PATH**:
   - Path: `docs/reference/backend/tasks/{story-name}.md`
   - NO exceptions, NO other locations

## Language Configuration

Before generating any content, check `aico.json` in project root for `language` field to determine the output language. If not set, default to English.

## Process

1. **Read story/PRD**: Load from `docs/reference/pm/stories/` or `docs/reference/pm/versions/`
2. **Identify data entities**: What domain objects are needed
3. **Identify API endpoints**: What routes are needed
4. **Identify business logic**: What services are needed
5. **Break into tasks**: Follow layered architecture order
6. **Save output**: ALWAYS write to `docs/reference/backend/tasks/{story-name}.md`

## Layered Architecture Order

```
1. Data Models (types, entities, DTOs)
      ↓
2. Database (migrations, schema)
      ↓
3. Repository Layer (data access)
      ↓
4. Service Layer (business logic)
      ↓
5. API Layer (controllers, routes)
      ↓
6. Validation & Error Handling
      ↓
7. Tests (unit, integration, API)
```

## Task File Template

```markdown
# [Story Name] - Backend Tasks

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
> Source: docs/reference/pm/stories/[story].md
> Status: in_progress

## Progress

| #   | Task                       | Status     | Notes |
| --- | -------------------------- | ---------- | ----- |
| 1   | Define data models         | ⏳ pending |       |
| 2   | Create database migrations | ⏳ pending |       |
| 3   | Implement repository layer | ⏳ pending |       |

## Tasks

### Task 1: Define data models

**Status**: ⏳ pending
**Goal**: Create types for domain entities
**Scope**: Entity types, DTOs, validation schemas
**Acceptance Criteria**:

- [ ] Types match business requirements
- [ ] No type errors
      **Dependencies**: None
```

## Task Types

| Type       | Examples                       |
| ---------- | ------------------------------ |
| Data Model | Define entities, DTOs, schemas |
| Database   | Migrations, indexes, seeds     |
| Repository | Data access layer              |
| Service    | Business logic                 |
| API        | Controllers, routes            |
| Validation | Input validation               |
| Testing    | Unit, integration, API tests   |

## Granularity Rules

- Each task = independently testable
- Each task = single responsibility
- Each task = clear scope (not too big, not too small)

## Key Rules

- ALWAYS follow layered architecture order
- MUST include test tasks for each layer
- ALWAYS note dependencies between tasks
- MUST save to `docs/reference/backend/tasks/` directory

## Common Mistakes

- ❌ Tasks too large (entire API) → ✅ Break into layers
- ❌ Skip data model first → ✅ Types before implementation
- ❌ Skip repository layer → ✅ Separate data access
- ❌ Forget validation → ✅ Always include validation task
