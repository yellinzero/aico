# PM - Product Manager

Your AI Product Manager for transforming ideas into structured, actionable product specifications.

## Overview

The PM employee helps you go from vague product ideas to well-defined requirements. It focuses on **what** to build and **why**, leaving the **how** to developers.

## Core Philosophy

| PM Does                                          | PM Doesn't                    |
| ------------------------------------------------ | ----------------------------- |
| Transform vague ideas into clear requirements    | Write code                    |
| Create user stories with acceptance criteria     | Make technical decisions      |
| Write PRDs and version plans                     | Track implementation progress |
| Clarify ambiguities through structured questions | Assign tasks to developers    |
| Analyze competitors                              | Design UI/UX details          |

## Skills (8)

| Skill                 | Description                                                            | Auto-Trigger                                      |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| `init`                | Initialize PM environment with constitution template                   | "initialize PM", "setup product management"       |
| `brainstorming`       | Guide structured dialogue to transform vague ideas into clear concepts | "I have an idea", "I want to build"               |
| `prd-writing`         | Create comprehensive Product Requirements Documents                    | "write PRD", "requirements document"              |
| `user-story-writing`  | Transform requirements into user stories with acceptance criteria      | "write user story", "create story"                |
| `clarification`       | Resolve requirement ambiguities through structured questioning         | "unclear", "what does X mean"                     |
| `acceptance-criteria` | Define testable Given/When/Then acceptance criteria                    | "acceptance criteria", "how do we know it's done" |
| `competitor-analysis` | Research and analyze competitors with feature matrix                   | "competitor analysis", "what do competitors do"   |
| `story-acceptance`    | Verify and close stories after tasks are completed                     | "verify story", "close story"                     |

## Commands (3)

| Command       | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `/pm.init`    | Initialize product constitution with constraints and domain info     |
| `/pm.plan`    | Create or update product plan (PRD + stories) for a requirement      |
| `/pm.clarify` | Clarify specific requirements by searching docs and asking questions |

## Typical Workflow

```
1. /pm.init              → Set up product constitution (one-time)
   ↓
2. Describe your idea    → PM triggers brainstorming skill
   ↓
3. /pm.plan              → Create PRD + user stories
   ↓
4. /pm.clarify           → Resolve ambiguities as needed
   ↓
5. Hand off to dev       → Stories ready for frontend/backend
   ↓
6. Dev completes tasks   → PM verifies and closes stories
```

## Document Structure

After using PM, your docs will be organized as:

```
docs/reference/pm/
├── constitution.md      # Product constitution (from /pm.init)
├── versions/
│   ├── v0.1.md          # Version plans (PRDs)
│   └── v0.2.md
└── stories/
    ├── S-001.md         # Individual user stories
    ├── S-002.md
    └── ...
```

## Skill Structure

```
skills/
├── init/
│   ├── SKILL.md
│   └── references/
│       └── constitution.template.md    # Constitution template
├── brainstorming/
├── prd-writing/
├── user-story-writing/
├── clarification/
├── acceptance-criteria/
├── competitor-analysis/
└── story-acceptance/
```

## Quick Start

### 1. First time setup

```
/pm.init
```

Answer guided questions to create your product constitution. This defines your product's constraints, target users, and domain terminology.

### 2. Add a new requirement

```
/pm.plan Add user authentication with email and password
```

PM will:

1. Check if requirement is clear (trigger brainstorming if vague)
2. Create a PRD in `docs/reference/pm/versions/`
3. Break down into user stories in `docs/reference/pm/stories/`
4. Add acceptance criteria to each story

### 3. Clarify something

```
/pm.clarify What happens when login fails?
```

PM will search related docs and ask targeted questions with recommended options.

### 4. Accept completed work

When frontend/backend notifies task completion, PM will:

1. Check all related task files
2. Verify acceptance criteria are met
3. Update story checkboxes
4. Close the story

## Integration with Other Employees

PM produces documentation that other employees consume:

```
PM Output                    Consumer
─────────────────────────────────────────
constitution.md         →   All employees (context)
versions/*.md (PRDs)    →   Frontend (design), Backend (planning)
stories/*.md            →   Frontend (tasks), Backend (tasks)
```

### Handoff Flow

```
PM creates story
    ↓
Frontend: /frontend.tasks S-001  →  Creates frontend tasks
Backend:  /backend.tasks S-001   →  Creates backend tasks
    ↓
Dev implements and notifies PM
    ↓
PM verifies and closes story
```

## Document Header Format

All PM-generated documents use this unified header:

```markdown
# [Document Title]

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
```

## Best Practices

1. **Start with /pm.init** - The constitution helps maintain consistency across all documents
2. **One feature at a time** - Don't try to plan everything at once
3. **Answer questions thoughtfully** - PM's clarification questions shape the final spec
4. **Review generated docs** - PM produces drafts; you approve the final version
5. **Let PM close stories** - PM checks both frontend and backend tasks before closing
