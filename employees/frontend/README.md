# Frontend - Frontend Engineer

Your AI Frontend Engineer for design system setup, page design, task breakdown, and TDD implementation.

## Overview

The Frontend employee helps you implement UI/UX from PM stories. It handles the full frontend development lifecycle: extracting design systems, creating page designs, breaking down tasks, and implementing with TDD.

## Core Philosophy

| Frontend Does                          | Frontend Doesn't            |
| -------------------------------------- | --------------------------- |
| Extract design tokens from references  | Define product requirements |
| Create page/component designs from PRD | Make product decisions      |
| Break down stories into ordered tasks  | Design database schemas     |
| Implement with TDD (test first)        | Write backend APIs          |
| Follow design system constraints       | Skip reading constraints    |

## Skills (6)

| Skill              | Description                                                                  | Auto-Trigger                                |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------- |
| `init`             | Initialize frontend environment with design system and constraints templates | "initialize frontend", "setup frontend"     |
| `style-extraction` | Extract design tokens from reference URL or screenshot                       | "extract style", "create design system"     |
| `design`           | Transform PRD into page designs with ASCII layouts and component specs       | "design the page", "page design"            |
| `task-breakdown`   | Break story into frontend tasks following UI development order               | "break down story", "create frontend tasks" |
| `plan`             | Create atomic 2-5 minute implementation steps with verification              | "atomic steps", "step-by-step plan"         |
| `implement`        | Execute implementation with TDD (test first, then code)                      | "implement this", "start coding"            |

## Commands (4)

| Command            | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `/frontend.init`   | Initialize frontend environment (design system + constraints) |
| `/frontend.design` | Generate page/component design from PRD                       |
| `/frontend.tasks`  | Break down a PM story into frontend tasks                     |
| `/frontend.plan`   | Create atomic implementation plan for a task                  |

## Typical Workflow

```
1. /frontend.init           → Set up design system + constraints (one-time)
   ↓
2. /frontend.design         → Create page design from PRD
   ↓
3. /frontend.tasks S-001    → Break story into ordered tasks
   ↓
4. /frontend.plan           → Create atomic steps for a task
   ↓
5. Implement with TDD       → Test first, then code
   ↓
6. Notify PM                → PM verifies and closes story
```

## Document Structure

After using Frontend, your docs will be organized as:

```
docs/reference/frontend/
├── design-system.md       # Design tokens (from /frontend.init)
├── constraints.md         # Tech stack and patterns
├── designs/
│   ├── login-page.md      # Page designs
│   └── dashboard.md
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
│       ├── design-system.template.md   # Design system template
│       └── constraints.template.md     # Constraints template
├── style-extraction/
├── design/
├── task-breakdown/
├── plan/
└── implement/
```

## Quick Start

### 1. First time setup

```
/frontend.init
```

This will:

1. Ask for a reference website or screenshot
2. Extract design tokens (colors, typography, spacing)
3. Create `docs/reference/frontend/design-system.md`
4. Create `docs/reference/frontend/constraints.md` with your tech stack

### 2. Design a page

```
/frontend.design Login page from docs/reference/pm/versions/v0.1.md
```

Frontend will:

1. Read the PRD and design system
2. Create ASCII layout
3. List all components with props
4. Document interactions
5. Save to `docs/reference/frontend/designs/`

### 3. Break down tasks

```
/frontend.tasks S-001
```

Frontend will:

1. Read the story from `docs/reference/pm/stories/S-001.md`
2. Read the design from `docs/reference/frontend/designs/`
3. Break into tasks following UI development order:
   - Setup → Static UI → Dynamic Logic → Interactions → Tests
4. Save to `docs/reference/frontend/tasks/S-001.md`

### 4. Implement with TDD

```
Implement task 1 from the task file
```

Frontend will:

1. Read constraints and design system
2. Write failing test first (RED)
3. Write minimal code to pass (GREEN)
4. Refactor if needed
5. Update task status
6. Notify PM when all tasks complete

## Task Ordering

Frontend tasks follow UI development layers:

```
1. Setup          → Create component structure, setup state
   ↓
2. Static UI      → Implement layout and static content
   ↓
3. Dynamic Logic  → Add form validation, API integration
   ↓
4. Interactions   → Implement hover, click, animations
   ↓
5. Tests          → Unit tests, integration tests
```

## TDD Workflow

Frontend enforces Test-Driven Development:

```
RED    → Write failing test
       → Verify it fails
GREEN  → Write minimal code to pass
       → Verify it passes
REFACTOR → Clean up (keep tests passing)
```

## Integration with Other Employees

```
PM Story                     Frontend Actions
─────────────────────────────────────────────────
docs/reference/pm/stories/   → /frontend.tasks (break down)
                             → /frontend.design (create design)
                             → Implement with TDD
                             → Notify PM for acceptance
```

### Shared Skills

Frontend also has access to shared skills:

- `code-review` - Request structured code review
- `worktree` - Create isolated git worktree for feature work
- `subagent-driven` - Execute plan with automated quality gates

## Document Header Format

All Frontend-generated documents use this unified header:

```markdown
# [Document Title]

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
```

## Best Practices

1. **Always run /frontend.init first** - Design system ensures consistency
2. **Read constraints before coding** - Never skip this step
3. **Follow task order** - Setup → Static → Dynamic → Interactions → Tests
4. **TDD is mandatory** - Write failing test before any production code
5. **Update task status** - Mark tasks complete as you finish them
6. **Notify PM** - Let PM verify and close the story
