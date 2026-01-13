---
description: Initialize frontend configuration with design system and constraints
---

# /frontend.init - Initialize Frontend

Initialize frontend engineer configuration files: design system and constraints.

## What This Command Does

1. Create `docs/reference/frontend/` directory structure
2. Create design system file (from template or reference website)
3. Create frontend constraints file (interactive or from template)

## Skills Used

- `aico-frontend-init` - Initialize frontend environment with templates
- `aico-frontend-style-extraction` - Extract design system from reference website (optional)

## Document Header Format

All generated documents MUST use this unified header format:

```markdown
# [Document Title]

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
```

## Output Structure

```
docs/reference/frontend/
├── design-system.md     # Design tokens (colors, typography, spacing)
├── constraints.md       # Tech stack, patterns, conventions
├── designs/             # Page/component designs (from /frontend.design)
└── tasks/               # Task lists (from /frontend.tasks)
```

## Workflow

```
/frontend.init [options]
        │
        ▼
┌───────────────────────────────────┐
│ Create directory structure        │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Design System Setup               │
│ ─────────────────                 │
│ Choose one:                       │
│ (A) Reference website → extract   │
│ (B) Fill template manually        │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Constraints Setup                 │
│ ─────────────────                 │
│ Interactive prompts:              │
│ - Framework (React/Vue/Svelte)    │
│ - Component library               │
│ - Styling approach                │
│ - Directory structure             │
└───────────┴───────────────────────┘
```

## Usage

```bash
# Full interactive setup
/frontend.init

# With reference website for design system
/frontend.init --ref https://example.com

# Skip interactive, use defaults
/frontend.init --yes
```

## Skills Used

- `aico-frontend-init` - Initialize frontend environment with templates
- `aico-frontend-style-extraction` - Extract design system from reference website (optional)

## Design System Options

### Option A: Extract from Reference Website

If user provides a reference URL:

1. Check if Playwright MCP is available
2. If available: Navigate to URL → take screenshot → analyze
3. If not available: Ask user to provide screenshot
4. Extract design tokens using `aico-frontend-style-extraction` skill

### Option B: Fill Template

If no reference, create template and guide user:

1. Create `design-system.md` with placeholder values
2. Ask about color preferences (light/dark, accent color)
3. Ask about typography (serif/sans-serif)
4. Fill in reasonable defaults

## Constraints Prompts

Ask user about:

| Question          | Options                                      |
| ----------------- | -------------------------------------------- |
| Framework         | React, Vue, Svelte, Other                    |
| TypeScript        | Yes (recommended), No                        |
| Component Library | shadcn/ui, Ant Design, MUI, None             |
| Styling           | Tailwind CSS, CSS Modules, styled-components |
| Testing           | Vitest, Jest, None                           |
| Directory Pattern | Feature-based, Type-based                    |
