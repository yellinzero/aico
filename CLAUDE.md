# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## About aico

**aico** (AI Company) is an open-source AI employee framework that lets you manage AI collaborators like managing employees. The framework provides a CLI tool for installing and managing AI "employees" - packages of skills, commands, and documentation that extend AI coding assistants.

**aico CLI** is the command-line interface that installs AI employees into projects. It sets up the necessary directory structures, skills, and commands to support AI-assisted development workflows.

The toolkit supports multiple AI coding assistants, allowing teams to use their preferred tools while maintaining consistent project structure and development practices.

---

## General Practices

- Any changes to CLI commands require updating the corresponding help text and documentation.
- When modifying employee definitions, run `pnpm build:registry` to regenerate registry JSON files.
- Use conventional commits: `type(scope): subject` (e.g., `feat(cli): add search command`).

## Adding New Employee Support

This section explains how to add new AI employees to the aico framework. Use this guide as a reference when creating new employee types.

### Overview

aico supports multiple AI employees by providing employee-specific skills, commands, and documentation. Each employee has:

- **Skills** (SKILL.md files with AI capability definitions)
- **Commands** (Slash commands for common workflows)
- **Documentation** (Reference docs for the employee's domain)

### Current Supported Employees

| Employee     | Role              | Skills | Commands | Description                                    |
| ------------ | ----------------- | ------ | -------- | ---------------------------------------------- |
| **pm**       | Product Manager   | 7      | 3        | Product requirements and user story management |
| **frontend** | Frontend Engineer | 8      | 4        | UI/UX implementation and frontend development  |
| **backend**  | Backend Engineer  | 5      | 3        | API and backend system development             |

### Shared Skills (`_shared`)

Shared skills are reusable capabilities that multiple employees depend on. They are automatically installed when you add an employee that declares them as dependencies.

| Skill               | Description                                         |
| ------------------- | --------------------------------------------------- |
| **code-review**     | Structured code review for quality assurance        |
| **subagent-driven** | Execute implementation plans with subagent dispatch |
| **worktree**        | Git worktree management for isolated development    |

**How shared skills work:**

- Declared in `employee.json` via the `dependencies` field
- Automatically installed with the first employee that needs them
- Reference-counted: only removed when no employees depend on them
- Named as `aico-{skill}` (e.g., `aico-code-review`) without employee prefix

### Step-by-Step Integration Guide

Follow these steps to add a new employee:

#### 1. Create Employee Directory Structure

Create the employee directory in `employees/`:

```
employees/new-employee/
├── employee.json           # Employee metadata
├── README.md               # Employee documentation
├── skills/                 # Skill definitions
│   └── skill-name/
│       └── SKILL.md
├── commands/               # Command definitions
│   └── command-name.md
└── docs/                   # Reference documentation
```

#### 2. Define employee.json

```json
{
  "name": "new-employee",
  "role": "Role Title",
  "description": "What this employee does",
  "skills": ["skill-1", "skill-2"],
  "commands": ["command-1", "command-2"],
  "docs": ["reference-doc.md"],
  "dependencies": [
    "@the-aico/_shared/code-review",
    "@the-aico/_shared/subagent-driven"
  ]
}
```

The `dependencies` field declares shared skills that will be automatically installed with this employee.

#### 3. Create Skills

Each skill requires a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: aico-{employee}-{skill}
description: |
  What the skill does and when to use it.
  Include triggering conditions here.
---
# Skill Name

[Instructions for using the skill]
```

#### 4. Create Commands

Commands are Markdown files in `commands/`:

```markdown
# Command Name

[Command instructions and workflow]
```

#### 5. Update Registry

Run `pnpm build:registry` to generate the registry JSON files.

## Supported Platforms

| Platform        | Skills Directory  | Commands Directory  | Instructions File |
| --------------- | ----------------- | ------------------- | ----------------- |
| **Claude Code** | `.claude/skills/` | `.claude/commands/` | `CLAUDE.md`       |
| **Codex**       | `.codex/skills/`  | `~/.codex/prompts/` | `AGENTS.md`       |

### Platform Differences

| Feature            | Claude Code                   | Codex                                |
| ------------------ | ----------------------------- | ------------------------------------ |
| Skills Location    | `.claude/skills/` (project)   | `.codex/skills/` (project)           |
| Skills Format      | SKILL.md                      | SKILL.md (same)                      |
| Commands Location  | `.claude/commands/` (project) | `~/.codex/prompts/` (global)         |
| Command Invocation | `/{command}`                  | `/prompts:aico.{employee}.{command}` |
| Skill Trigger      | Auto-detect                   | Auto-detect or `$skill-name`         |

## Project Structure

```
aico/
├── packages/cli/            # CLI package (@the-aico/cli)
├── apps/web/                # Website (the-aico.com) → see apps/web/CLAUDE.md
├── employees/               # Employee definitions (source)
│   ├── _shared/             # Shared skills (used by multiple employees)
│   │   └── skills/
│   │       ├── code-review/
│   │       ├── subagent-driven/
│   │       └── worktree/
│   ├── pm/                  # Product Manager
│   ├── frontend/            # Frontend Engineer
│   └── backend/             # Backend Engineer
├── registry/                # Build output (JSON)
├── docs/reference/          # Reference documentation
└── tests/                   # Skill testing framework
```

## Common Commands

```bash
# Development
pnpm dev                    # Watch mode (CLI)
pnpm build                  # Build CLI
pnpm test                   # Run unit tests

# Registry
pnpm build:registry         # Build registry JSON files

# Skill Testing
./tests/run-all.sh          # Run all skill tests
./tests/run-all.sh --fast   # Fast mode (content tests only)

# CLI Usage (after build)
npx aico init               # Initialize project
npx aico add <employee>     # Add employee (e.g., @the-aico/pm)
npx aico remove <employee>  # Remove employee
npx aico update [employee]  # Update employee(s)
npx aico list [--remote]    # List employees
npx aico search <query>     # Search employees/skills
npx aico diff [employee]    # Check for updates
npx aico check              # Verify installation
npx aico build              # Build registry
```

## Skill Naming Convention

Skills follow the naming pattern: `aico-{employee}-{skill}`

| Employee | Skill Pattern     | Example                  |
| -------- | ----------------- | ------------------------ |
| pm       | `aico-pm-*`       | `aico-pm-brainstorming`  |
| frontend | `aico-frontend-*` | `aico-frontend-design`   |
| backend  | `aico-backend-*`  | `aico-backend-implement` |
| \_shared | `aico-*`          | `aico-code-review`       |

## Standard Paths Convention

| Path                       | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `docs/reference/`          | Fixed convention path for all employee-generated reference docs |
| `docs/reference/pm/`       | PM documents (constitution, versions, stories)                  |
| `docs/reference/frontend/` | Frontend documents (designs, constraints, tasks)                |
| `docs/reference/backend/`  | Backend documents (tasks, constraints)                          |

## Testing New Employee Integration

1. **Build test**: Run `pnpm build:registry` to verify JSON generation
2. **CLI test**: Test `npx aico add @the-aico/<employee>` command
3. **File generation**: Verify correct directory structure and files
4. **Skill validation**: Ensure skills trigger correctly
5. **Command validation**: Test slash commands work as expected

## Common Pitfalls

1. **Forgetting to rebuild registry**: Always run `pnpm build:registry` after modifying employees.
2. **Incorrect skill naming**: Use `aico-{employee}-{skill}` pattern consistently.
3. **Missing frontmatter**: Skills require YAML frontmatter with `name` and `description`.
4. **Wrong path conventions**: Use `docs/reference/` for all reference documentation.
5. **Platform inconsistency**: Ensure skills work on both Claude Code and Codex.

## Future Considerations

When adding new employees:

- Consider the employee's domain expertise and responsibilities
- Ensure skills are independent and composable
- Document any special requirements or limitations
- Update this guide with lessons learned

---

_This documentation should be updated whenever new employees are added to maintain accuracy and completeness._
