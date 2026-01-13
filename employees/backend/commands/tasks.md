---
description: Break down a PM story into backend tasks
---

# Break Down Story into Backend Tasks

Convert a PM story/PRD into actionable backend tasks with progress tracking.

## Usage

```
/backend.tasks [story-name]
```

## Arguments

- `story-name` (optional): Name of the story to break down
  - If not provided, list available stories and ask user to select

## Steps

1. **Locate story**
   - Search in `docs/reference/pm/stories/`
   - Search in `docs/reference/pm/versions/`
   - If story-name provided, find matching file
   - If not provided, list available stories for selection

2. **Invoke task-breakdown skill**
   - Use `aico-backend-task-breakdown` skill
   - Read story/PRD content
   - Analyze backend requirements
   - Decompose into tasks following layered architecture

3. **Create task file**
   - Output to `docs/reference/backend/tasks/[story-name].md`
   - Include progress tracking table
   - Define each task with acceptance criteria

## Output

```
✓ Found story: [story-name]
✓ Analyzed backend requirements
✓ Created docs/reference/backend/tasks/[story-name].md

Tasks created:
1. Define data models (⏳ pending)
2. Create database migrations (⏳ pending)
3. Implement repository layer (⏳ pending)
...
```
