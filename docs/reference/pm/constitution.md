# aico Product Constitution

> Project: aico
> Created: 2026-01-07
> Last Updated: 2026-01-09

This document provides shared constraints and domain information for all product management activities.

---

## Product Overview

### Basic Information

| Item                    | Content                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Product Name**        | aico (AI Company)                                                                   |
| **One-line Definition** | AI employee framework that lets you manage AI collaborators like managing employees |
| **Slogan**              | Build AI teams in seconds, start working instantly                                  |
| **Current Version**     | v1.0.0                                                                              |

### Target Users

| User Type            | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| **Developers**       | Developers using AI-assisted coding who need standardized AI behavior management |
| **Technical Teams**  | Teams wanting to standardize AI collaboration workflows                          |
| **AI Tool Creators** | Creators wanting to share/publish their AI capability definitions                |

### Core Value Proposition

Users (CEO) make decisions and do deep thinking, AI employees focus on execution. Through structured Employee, Skill, Command, and Doc mechanisms, AI collaboration becomes more controllable, reusable, and shareable.

---

## Core Principles

| Role      | CEO (User)         | AI Employee           |
| --------- | ------------------ | --------------------- |
| Decision  | ✅ Makes decisions | ❌ No decisions       |
| Thinking  | ✅ Deep thinking   | ❌ No creativity      |
| Execution | ❌ No execution    | ✅ Focus on execution |

**Reason**: AI currently can only reach 70-80% quality level, the remaining 20-30% needs human oversight.

---

## Two Core Components

| Component        | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| **aico CLI**     | Command-line tool for adding/managing AI employees                     |
| **the-aico.com** | Employee library website for browsing, searching, documentation (v1.0) |

---

## Core Terminology

| Term          | Definition                                                                     |
| ------------- | ------------------------------------------------------------------------------ |
| **Employee**  | AI capability package containing skills, commands, and docs                    |
| **Skill**     | AI capability definition written in SKILL.md format                            |
| **Command**   | Slash command definition that triggers specific workflows                      |
| **Doc**       | Reference documentation for AI and human reading                               |
| **Registry**  | Employee distribution server providing JSON-format employee definitions        |
| **aico.json** | Project configuration file recording installed employees and platform settings |

---

## Technical Constraints

| Constraint              | Description     |
| ----------------------- | --------------- |
| **Language**            | TypeScript      |
| **Runtime**             | Node.js 20+     |
| **CLI Framework**       | commander       |
| **Schema Validation**   | zod             |
| **Interactive Prompts** | prompts         |
| **Progress Display**    | ora             |
| **Colored Output**      | kleur           |
| **HTTP Requests**       | node-fetch      |
| **File Matching**       | fast-glob       |
| **File Operations**     | fs-extra        |
| **Build Tool**          | tsup            |
| **Package Manager**     | pnpm (monorepo) |

---

## Platform Support

| Platform        | Support Method                        | Status         |
| --------------- | ------------------------------------- | -------------- |
| **Claude Code** | Native Skills/Commands in `.claude/`  | ✅ Implemented |
| **Codex**       | Native Skills in `.codex/`, AGENTS.md | ✅ Implemented |

### Claude Code vs Codex Differences

| Feature           | Claude Code             | Codex                        |
| ----------------- | ----------------------- | ---------------------------- |
| Skills Location   | `.claude/skills/`       | `.codex/skills/`             |
| Skills Format     | SKILL.md (same)         | SKILL.md (same)              |
| Instructions File | `CLAUDE.md`             | `AGENTS.md`                  |
| Commands          | `.claude/commands/*.md` | Custom prompts               |
| Skill Trigger     | Auto-detect             | Auto-detect or `$skill-name` |

> **Note**: Codex natively supports skills since December 2025, format is identical to Claude Code!

---

## Project Structure

```
aico/
├── .claude/
│   └── skills/
│       └── skill-creator/            # Skill creation tool
│           ├── SKILL.md
│           ├── scripts/              # init_skill.py, package_skill.py
│           └── references/           # Design pattern references
├── packages/
│   └── cli/                          # CLI package (@the-aico/cli)
│       ├── src/
│       │   ├── index.ts              # Entry point
│       │   ├── commands/             # CLI commands
│       │   │   ├── init.ts           # aico init
│       │   │   ├── add.ts            # aico add <employee>
│       │   │   ├── list.ts           # aico list
│       │   │   ├── diff.ts           # aico diff
│       │   │   └── build.ts          # aico build (registry)
│       │   ├── registry/             # Registry logic
│       │   │   ├── client.ts         # Registry client
│       │   │   └── local.ts          # Local registry reading
│       │   ├── installer/            # Installation logic
│       │   │   ├── index.ts          # Core installer
│       │   │   └── platforms/        # Platform adapters
│       │   │       ├── claude-code.ts
│       │   │       └── codex.ts
│       │   ├── utils/                # Utility functions
│       │   │   ├── config.ts         # Config read/write
│       │   │   ├── logger.ts         # ora + kleur output
│       │   │   └── errors.ts         # AicoError class
│       │   └── schema/               # Zod schemas
│       │       ├── config.ts
│       │       ├── employee.ts
│       │       └── skill.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── employees/                        # Employee definitions (source)
│   └── pm/                           # PM employee
│       ├── employee.json
│       ├── README.md
│       ├── skills/                   # 8 skills
│       ├── commands/                 # 3 commands
│       └── docs/
├── registry/                         # Build output (JSON)
│   ├── index.json                    # Employee index
│   └── {employee}.json               # Employee definition (with content)
├── tests/                            # Skill testing framework
│   ├── lib/                          # Test utilities
│   ├── skill-triggering/             # Auto-trigger tests
│   ├── explicit-skill-requests/      # Explicit request tests
│   └── skill-content/                # Content understanding tests
├── docs/
│   └── reference/                    # Reference documentation
├── pnpm-workspace.yaml
└── package.json
```

---

## Standard Path Conventions

| Path                       | Purpose                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| `docs/reference/`          | **Fixed convention path**, all employee-generated reference docs stored here |
| `docs/reference/pm/`       | PM employee product docs (constitution, versions, stories)                   |
| `docs/reference/frontend/` | Frontend employee design docs (designs, constraints)                         |
| `docs/reference/backend/`  | Backend employee technical docs (tasks, constraints)                         |

> **Note**: `docs/reference` is a standard convention path, not configurable. All skills and commands use this path.

---

## CLI Commands

```bash
# Development
pnpm dev                # Watch mode
pnpm build              # Build CLI

# Testing
pnpm test               # Run tests
./tests/run-all.sh      # Run all skill tests

# CLI Usage
npx aico init           # Initialize project
npx aico add <employee> # Add employee
npx aico list           # List employees
npx aico diff           # Check for updates
npx aico build          # Build registry (for publishers)
```

---

## Configuration File Formats

### aico.json (User Project Config)

```json
{
  "$schema": "https://the-aico.com/schema/config.json",
  "defaultPlatform": "claude-code",
  "platforms": {
    "claude-code": {
      "skills": ".claude/skills",
      "commands": ".claude/commands"
    }
  },
  "employees": {},
  "registries": {
    "@the-aico": "https://the-aico.com/r/{name}.json"
  }
}
```

### employee.json (Employee Definition)

```json
{
  "name": "frontend",
  "role": "Frontend Engineer",
  "description": "React + TypeScript development",
  "skills": [...],
  "commands": [...],
  "docs": [...]
}
```

---

## SKILL.md Writing Guidelines

### Using skill-creator Tool

Located at `.claude/skills/skill-creator/`, provides:

- `scripts/init_skill.py` - Initialize new skill
- `scripts/package_skill.py` - Package and validate skill
- `references/` - Design patterns and best practices

### CSO (Claude Search Optimization)

**Key Principle**: If description summarizes the workflow, Claude may skip full content and act only based on description.

```yaml
# ❌ BAD - Summarizes workflow, Claude may take shortcuts
description: Use when executing plans - dispatches subagent per task with code review

# ✅ GOOD - Only write trigger conditions, don't summarize workflow
description: Use when executing implementation plans with independent tasks
```

### SKILL.md Format

```yaml
---
name: aico-{employee}-{skill}
description: Use when [specific triggering conditions]
---

# Skill Name

## Overview
Core principles in 1-2 sentences

## When to Use
- [Trigger scenarios]
- When NOT to use: [Counter-examples]

## Core Pattern
[Key info tables or code examples]

## Implementation
[Specific steps]

## Common Mistakes
- ❌ [Wrong approach] → ✅ [Correct approach]
```

### Naming Convention

Skills are named `aico-{employee}-{skill}` to avoid conflicts with other skills.

### Size Limits

- Frequently used skills: < 150 words
- Other skills: < 500 words
- Description: ≤ 500 characters (only trigger conditions)

---

## Naming Conventions

| Type            | Convention | Example                         |
| --------------- | ---------- | ------------------------------- |
| Employee name   | kebab-case | `frontend`, `backend`, `pm`     |
| Skill name      | kebab-case | `code-review`, `design-to-code` |
| Command name    | kebab-case | `plan`, `review`                |
| File name       | kebab-case | `react-typescript.md`           |
| Registry prefix | @-prefixed | `@the-aico`, `@custom`          |

---

## Version Specification

- Follow Semantic Versioning (SemVer)
- Format: `v{major}.{minor}.{patch}`
- Example: `v1.0.0`, `v1.1.0`, `v2.0.0`

---

## Development Standards

### TypeScript

- Use strict mode
- Avoid `any` type
- Use Zod for runtime validation

### Git Commits

- Use Conventional Commits
- Format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, test, chore

### Code Style

- Use ES modules
- Target Node.js 20+
- Keep functions small and focused

---

## Skill Trigger Acceptance Criteria

### Acceptance Metrics

| Metric        | Definition                              | Target |
| ------------- | --------------------------------------- | ------ |
| **Precision** | Correct triggers / Total triggers       | ≥ 80%  |
| **Recall**    | Correct triggers / Should-trigger count | ≥ 70%  |

### Acceptance Process

1. Prepare 10 test conversations for each skill
2. Execute conversations, manually judge if correctly triggered
3. Calculate precision/recall
4. Iterate and optimize description based on results
