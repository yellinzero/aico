---
description: Initialize backend constraints file for the project
---

# Initialize Backend Environment

Set up the backend development environment by creating the constraints file.

## Skills Used

- `aico-backend-init` - Initialize backend environment with constraints template

## Document Header Format

All generated documents MUST use this unified header format:

```markdown
# [Document Title]

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
```

## Steps

1. **Check existing constraints**
   - Look for `docs/reference/backend/constraints.md`
   - If exists, ask user if they want to overwrite or skip

2. **Create directory structure**

   ```
   docs/reference/backend/
   ├── constraints.md      # Backend constraints (from template)
   └── tasks/              # Task tracking directory
   ```

3. **Generate constraints file**
   - Guide user through key decisions:
     - Language/Runtime (Node.js, Python, Go, etc.)
     - Framework (Express, FastAPI, Gin, etc.)
     - Database (PostgreSQL, MongoDB, etc.)
     - ORM/Query builder
     - Testing framework
     - API style (REST, GraphQL, gRPC)

4. **Validate setup**
   - Confirm constraints file created
   - Confirm tasks directory exists

## Output

```
✓ Created docs/reference/backend/constraints.md
✓ Created docs/reference/backend/tasks/
✓ Backend environment initialized
```
