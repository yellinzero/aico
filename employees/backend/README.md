# Backend - Backend Engineer

Your AI Backend Engineer for API design, database architecture, task breakdown, and TDD implementation.

## Overview

The Backend employee helps you implement server-side logic from PM stories. It handles the full backend development lifecycle: breaking down tasks by architectural layers, creating atomic implementation plans, and implementing with strict TDD.

## Core Philosophy

| Backend Does                           | Backend Doesn't             |
| -------------------------------------- | --------------------------- |
| Break down stories into layered tasks  | Define product requirements |
| Create atomic TDD implementation plans | Make product decisions      |
| Implement with strict TDD (test first) | Design UI/UX                |
| Follow architectural layer order       | Skip reading constraints    |
| Design APIs and database schemas       | Write frontend code         |

## Skills (4)

| Skill            | Description                                                         | Auto-Trigger                                           |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| `init`           | Initialize backend environment with constraints template            | "initialize backend", "setup backend"                  |
| `task-breakdown` | Break story into backend tasks following layered architecture order | "break down story for backend", "create backend tasks" |
| `plan`           | Create atomic 2-5 minute TDD implementation steps with verification | "atomic steps", "step-by-step plan"                    |
| `implement`      | Execute implementation with strict TDD (test first, then code)      | "implement backend", "start coding backend"            |

## Commands (3)

| Command          | Description                                       |
| ---------------- | ------------------------------------------------- |
| `/backend.init`  | Initialize backend environment (constraints file) |
| `/backend.tasks` | Break down a PM story into backend tasks          |
| `/backend.plan`  | Create atomic implementation plan for a task      |

## Typical Workflow

```
1. /backend.init            → Set up constraints (one-time)
   ↓
2. /backend.tasks S-001     → Break story into layered tasks
   ↓
3. /backend.plan            → Create atomic TDD steps for a task
   ↓
4. Implement with TDD       → Test first, then code
   ↓
5. Notify PM                → PM verifies and closes story
```

## Document Structure

After using Backend, your docs will be organized as:

```
docs/reference/backend/
├── constraints.md         # Tech stack, patterns, conventions
└── tasks/
    ├── S-001.md           # Task breakdowns per story
    └── S-002.md
```

## Skill Structure

```
skills/
├── init/
│   ├── SKILL.md
│   └── references/
│       └── constraints.template.md    # Constraints template
├── task-breakdown/
├── plan/
└── implement/
```

## Quick Start

### 1. First time setup

```
/backend.init
```

This will guide you through:

1. Language/Runtime (Node.js, Python, Go, etc.)
2. Framework (Express, FastAPI, Gin, etc.)
3. Database (PostgreSQL, MongoDB, etc.)
4. ORM/Query builder
5. Testing framework
6. API style (REST, GraphQL, gRPC)

Creates `docs/reference/backend/constraints.md`.

### 2. Break down tasks

```
/backend.tasks S-001
```

Backend will:

1. Read the story from `docs/reference/pm/stories/S-001.md`
2. Analyze backend requirements
3. Break into tasks following layered architecture:
   - Data Models → Database → Repository → Service → API → Validation → Tests
4. Save to `docs/reference/backend/tasks/S-001.md`

### 3. Create implementation plan

```
/backend.plan 1
```

Backend will:

1. Read task details from the task file
2. Read constraints
3. Create atomic 2-5 minute steps with TDD
4. Each step includes Files, Action, and Verify command

### 4. Implement with TDD

```
Implement task 1 from the task file
```

Backend will:

1. Read constraints first
2. Write failing test (RED)
3. Verify test fails
4. Write minimal code to pass (GREEN)
5. Verify test passes
6. Refactor if needed
7. Update task status
8. Notify PM when all tasks complete

## Layered Architecture Order

Backend tasks follow architectural layers:

```
1. Data Models     → Types, entities, DTOs
   ↓
2. Database        → Migrations, schema
   ↓
3. Repository      → Data access layer
   ↓
4. Service         → Business logic
   ↓
5. API             → Controllers, routes
   ↓
6. Validation      → Input validation, error handling
   ↓
7. Tests           → Unit, integration, API tests
```

## TDD Workflow

Backend enforces strict Test-Driven Development:

```
RED    → Write ONE failing test
       → Verify it fails (MANDATORY)
GREEN  → Write minimal code to pass
       → Verify it passes
REFACTOR → Clean up (keep tests passing)
```

### TDD Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? **Delete it. Start over.**

### Test Types

| Type        | Purpose         | Example                          |
| ----------- | --------------- | -------------------------------- |
| Unit        | Single function | `authService.validatePassword()` |
| Integration | With real DB    | `userRepository.create()`        |
| API         | HTTP endpoints  | `POST /auth/register`            |

## Integration with Other Employees

```
PM Story                     Backend Actions
─────────────────────────────────────────────────
docs/reference/pm/stories/   → /backend.tasks (break down)
                             → /backend.plan (create steps)
                             → Implement with TDD
                             → Notify PM for acceptance
```

### Shared Skills

Backend also has access to shared skills:

- `code-review` - Request structured code review
- `worktree` - Create isolated git worktree for feature work
- `subagent-driven` - Execute plan with automated quality gates

## Document Header Format

All Backend-generated documents use this unified header:

```markdown
# [Document Title]

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
```

## Best Practices

1. **Always run /backend.init first** - Constraints ensure consistency
2. **Read constraints before coding** - Never skip this step
3. **Follow layer order** - Data Models → DB → Repository → Service → API → Tests
4. **TDD is mandatory** - Write failing test before any production code
5. **Verify test fails** - Never skip the RED verification step
6. **Update task status** - Mark tasks complete as you finish them
7. **Notify PM** - Let PM verify and close the story

## Error Handling

| Error Type           | Action                          |
| -------------------- | ------------------------------- |
| Test failure         | Debug, fix, re-run              |
| Type error           | Fix types, re-verify            |
| Lint error           | Fix style issues                |
| Constraint violation | Re-read constraints, align code |
