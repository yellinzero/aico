---
description: Initialize PM constitution document with product constraints and domain information
---

# /pm.init - Initialize Product Constitution

Initialize the product constitution document that provides shared constraints and domain information for all PM activities.

## What This Command Does

1. Check if `docs/reference/pm/constitution.md` exists
2. If not exists: Generate constitution document through guided questions
3. If exists: Ask if user wants to update specific sections

## Skills Used

- `aico-pm-init` - Initialize PM environment with constitution template

## Document Header Format

All generated documents MUST use this unified header format:

```markdown
# [Document Title]

> Project: [project-name]
> Created: YYYY-MM-DD
> Last Updated: YYYY-MM-DD
```

## Constitution Document Sections

The generated `constitution.md` will include:

### Product Overview

- Product name and description
- Target users and personas
- Core value proposition

### Domain Information

- Industry/market context
- Key terminology
- Regulatory or compliance requirements (if any)

### Constraints

- Technical constraints
- Business constraints
- Timeline constraints

### Standards

- Documentation language preference
- Naming conventions
- Version numbering scheme

## Usage

```
/pm.init
```

## Guided Questions

The command will ask questions like:

- "What is this product/project called?"
- "Who are the target users?"
- "What industry or domain is this for?"
- "Any specific constraints to be aware of?"

## Output

Creates or updates: `docs/reference/pm/constitution.md`

## Note

This constitution document will be referenced by all other PM skills to ensure consistency across all product documentation.
