---
description: Clarify specific requirements by searching related documents and asking targeted questions
---

# /pm.clarify - Requirement Clarification

Clarify specific requirements by searching related documents and asking targeted questions.

## What This Command Does

1. Search `docs/reference/pm/` for related documentation
2. Identify ambiguities or missing information
3. Ask clarifying questions one at a time
4. Update relevant documents with answers

## Workflow

1. **Search Phase**: Find all documents related to the query
2. **Analysis Phase**: Identify gaps and ambiguities
3. **Question Phase**: Ask targeted questions (max 5)
4. **Update Phase**: Update docs with clarified information

## Usage

```
/pm.clarify [specific topic or question]
```

## Examples

```
/pm.clarify What happens when a user's session expires?

/pm.clarify Authentication flow for mobile users

/pm.clarify Error handling for payment failures
```

## Question Format

Each question will be presented as:

```markdown
### Question 1 of N: [Topic]

**Context**: [Quote from existing docs]

**Ambiguity**: [What's unclear]

**Options**:
| Option | Description |
|--------|-------------|
| A | [First choice] |
| B | [Second choice] |

**Recommended**: [Option] because [reasoning]
```

## Skills Used

- `aico-pm-clarification` - Core clarification logic

## Output

Updates to:

- Related story files (`docs/reference/pm/stories/S-XXX.md`)
- Version plans if scope affected
- Context document if product-level clarification

## Note

This command focuses on clarifying existing requirements, not creating new ones. For new requirements, use `/pm.plan`.
