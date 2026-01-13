---
description: Generate page/component design specs and frontend prompts from PRD
---

# /frontend.design - Generate Design Specs

Create page/component design specifications with layout, components, and implementation prompts.

## What This Command Does

1. Read PRD/story document
2. Read existing design system
3. Generate ASCII layouts and component specs
4. Generate frontend implementation prompts

## Prerequisites

- Design system must exist (`docs/reference/frontend/design-system.md`)
- Constraints must exist (`docs/reference/frontend/constraints.md`)
- PRD/story must exist (`docs/reference/pm/`)

## Workflow

```
/frontend.design [PRD path or story name]
        │
        ▼
┌───────────────────────────────────┐
│ Read design-system.md            │  ← Project-level constraint
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Read constraints.md              │  ← Tech stack constraint
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Read PRD/story document          │
└───────────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Call aico-frontend-design skill  │
│ - User flow                      │
│ - ASCII layout                   │
│ - Components                     │
│ - Frontend prompt                │
└───────────┴───────────────────────┘
```

## Usage

```bash
# Design from specific PRD
/frontend.design docs/reference/pm/versions/v1.0.0.md

# Design from story name
/frontend.design user-profile

# Design from latest version
/frontend.design
```

## Skills Used

- `aico-frontend-design` - Generate page design specs and frontend prompts

## Output Structure

```
docs/reference/frontend/designs/
├── homepage.md
├── user-profile.md
└── settings-page.md
```

## Design File Format

Each design file contains:

1. **User Flow** - Entry point → actions → outcome
2. **ASCII Layout** - Visual wireframe
3. **Sections** - Purpose, components, content for each section
4. **Component List** - All components with variants and props
5. **Responsive Notes** - Desktop/tablet/mobile differences
6. **Interactions** - Triggers, actions, feedback
7. **Frontend Prompt** - Complete implementation instructions

## Example

```bash
/frontend.design user-profile
```

Creates `docs/reference/frontend/designs/user-profile.md` with:

- User flow for viewing/editing profile
- ASCII layout of profile page
- Component specs (ProfileCard, ProfileForm, Avatar)
- Frontend prompt referencing design system

## Note

Frontend engineers should use the generated design files when implementing. The prompts contain everything needed to implement correctly:

- Reference to design system (don't duplicate)
- Specific component requirements
- Interaction specifications
