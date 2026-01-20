---
description: Create or update product plan for a requirement including version and story management
---

# /pm.plan - Product Planning

Create or update product plans for requirements, managing versions and stories.

## What This Command Does

1. Check PM constitution in `docs/reference/pm/constitution.md`
2. Scan existing docs to understand current product state
3. Based on user's requirement:
   - Create new version plan if needed
   - Add stories to existing version
   - Update existing stories

## Workflow

### First Time (No existing plans)

1. Read PM context (constitution.md) for constraints
2. Call `aico-pm-brainstorming` skill if requirement is vague
3. Call `aico-pm-prd-writing` skill to create version document (version = PRD)
4. Call `aico-pm-user-story-writing` skill to break down into stories
5. Call `aico-pm-acceptance-criteria` skill for each story

### Existing Plans

1. Scan `docs/reference/pm/` for existing versions and stories
2. Show current state summary
3. Ask: Add to existing version or create new version?
4. If new version: Call `aico-pm-prd-writing` skill
5. If existing version: Call `aico-pm-user-story-writing` skill to add stories

## Usage

```
/pm.plan [requirement description]
```

## Examples

```
/pm.plan Add user authentication with OAuth2 support

/pm.plan We need a dashboard showing user activity metrics

/pm.plan
```

If no description provided, command will ask for it.

## Output Structure

```
docs/reference/pm/
├── constitution.md      # Product constitution (from /pm.init)
├── versions/
│   ├── v0.1.md          # Version plan
│   └── v0.2.md
└── stories/
    ├── S-001.md         # Individual story
    ├── S-002.md
    └── ...
```

## Skills Used

- `aico-pm-brainstorming` - Call when requirement is vague or needs exploration
- `aico-pm-prd-writing` - Call to create version document (version = PRD)
- `aico-pm-user-story-writing` - Call to break PRD into user stories
- `aico-pm-acceptance-criteria` - Call for each story's acceptance criteria

## Note

The command will read existing documentation to maintain continuity and avoid duplicating work already done.
