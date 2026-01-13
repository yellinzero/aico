# Backend Constraints

> Project: aico
> Created: 2026-01-09
> Last Updated: 2026-01-09

## Overview

Backend development constraints file for aico CLI, defining tech stack, architecture standards, and development guidelines.

## Tech Stack

| Layer           | Technology | Version  |
| --------------- | ---------- | -------- |
| Language        | TypeScript | ^5.7.2   |
| Runtime         | Node.js    | >=20.0.0 |
| Package Manager | pnpm       | ^9.15.0  |
| Build Tool      | tsup       | ^8.5.0   |
| Test Framework  | Vitest     | ^3.0.0   |

## Core Dependencies

| Package   | Purpose             |
| --------- | ------------------- |
| commander | CLI framework       |
| zod       | Schema validation   |
| prompts   | Interactive prompts |
| ora       | Loading spinners    |
| kleur     | Colored output      |
| fs-extra  | File operations     |
| fast-glob | File matching       |
| diff      | Text diffing        |

## Project Structure

```
packages/cli/
├── src/
│   ├── index.ts              # Entry point
│   ├── commands/             # CLI commands
│   │   ├── init.ts
│   │   ├── add.ts
│   │   ├── list.ts
│   │   ├── diff.ts
│   │   ├── build.ts
│   │   └── remove.ts
│   ├── registry/             # Registry logic
│   │   ├── client.ts         # Remote registry
│   │   └── local.ts          # Local registry
│   ├── installer/            # Installation logic
│   │   ├── index.ts
│   │   └── platforms/
│   │       ├── claude-code.ts
│   │       └── codex.ts
│   ├── schema/               # Zod schemas
│   │   ├── config.ts
│   │   ├── employee.ts
│   │   └── skill.ts
│   └── utils/                # Utilities
│       ├── config.ts
│       ├── logger.ts
│       └── errors.ts
├── dist/                     # Build output
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always enabled
- **No `any`**: Avoid `any` type, use `unknown` if needed
- **ESM**: Use ES modules (`import`/`export`)
- **Type Annotations**: Explicit return types for public functions

### Zod Validation

- All external input must be validated with Zod
- Define schemas in `schema/` directory
- Export both schema and inferred type

```typescript
// Example
export const configSchema = z.object({...})
export type Config = z.infer<typeof configSchema>
```

### Error Handling

- Use custom `AicoError` class for known errors
- Include error code for programmatic handling
- Provide user-friendly messages and suggestions

```typescript
throw new AicoError('Config not found', 'NOT_INITIALIZED', {
  suggestion: 'Run `npx aico init` to initialize',
});
```

### File Operations

- Use `fs-extra` for all file operations
- Always use absolute paths internally
- Handle missing files gracefully

### CLI Output

- Use `ora` for spinners during async operations
- Use `kleur` for colored output
- Use `logger` utility for consistent formatting

## Commands Pattern

Each command follows this structure:

```typescript
import { Command } from 'commander'
import { z } from 'zod'

const optionsSchema = z.object({...})

async function runCommand(options: Options): Promise<void> {
  // Implementation
}

export const command = new Command()
  .name('command-name')
  .description('Command description')
  .option(...)
  .action(async (opts) => {
    const options = optionsSchema.parse(opts)
    await runCommand(options)
  })
```

## Testing

- Use Vitest for all tests
- Place tests in `__tests__/` directories
- Mock file system and network calls
- Test both success and error paths

## Git Conventions

- Use conventional commits
- Format: `type(scope): message`
- Types: feat, fix, docs, refactor, test, chore
