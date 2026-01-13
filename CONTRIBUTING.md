# Contributing

Thanks for your interest in contributing to aico. We're happy to have you here.

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to ask in [GitHub Discussions](https://github.com/yellinzero/aico/discussions).

## About this repository

This repository is a monorepo.

- We use [pnpm](https://pnpm.io) and [`workspaces`](https://pnpm.io/workspaces) for development.
- We use [Turborepo](https://turbo.build/repo) as our build system.

## Structure

This repository is structured as follows:

```
aico/
├── apps/
│   └── web                 # Next.js website application
├── packages/
│   └── cli                 # aico CLI package
├── employees/              # AI employee definitions
│   ├── pm/                 # Product Manager
│   ├── frontend/           # Frontend Engineer
│   └── backend/            # Backend Engineer
├── registry/               # Build artifacts (JSON)
├── docs/reference/         # Reference documentation
└── tests/                  # Test framework
```

| Path              | Description                                        |
| ----------------- | -------------------------------------------------- |
| `apps/web`        | The Next.js application for the website            |
| `packages/cli`    | The `aico` CLI package                             |
| `employees/`      | AI employee definitions (skills + commands + docs) |
| `registry/`       | Built registry JSON files                          |
| `docs/reference/` | Reference documentation used by skills             |

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/your-username/aico.git
```

### Navigate to project directory

```bash
cd aico
```

### Create a new Branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

```bash
pnpm install
```

### Run a workspace

You can use the `pnpm --filter=[WORKSPACE]` command to start the development process for a workspace.

#### Examples

1. To run the website:

```bash
pnpm --filter=web dev
```

2. To run the CLI in dev mode:

```bash
pnpm --filter=@the-aico/cli dev
```

## Running the CLI Locally

To run the CLI locally, you can follow the workflow:

1. Start by running the dev server:

   ```bash
   pnpm dev
   ```

2. In another terminal, build and test the CLI:

   ```bash
   pnpm build
   npx aico <init | add | ...>
   ```

   To test the CLI in a specific directory:

   ```bash
   npx aico init -c ~/Desktop/my-app
   ```

## Documentation

The documentation for this project is located in the `apps/web` workspace. You can run the documentation locally by running the following command:

```bash
pnpm --filter=web dev
```

Documentation is written using [MDX](https://mdxjs.com). You can find the documentation files in the `apps/web/content/docs` directory.

## AI Employees

We use a registry system for developing AI employees. You can find the source code for the employee definitions under `employees/`.

```bash
employees/
├── pm/                     # Product Manager
│   ├── employee.json       # Employee definition
│   ├── skills/             # Skills
│   └── commands/           # Commands
├── frontend/               # Frontend Engineer
└── backend/                # Backend Engineer
```

When adding or modifying employees, please ensure that:

1. You update the metadata in `employee.json`.
2. You update the documentation.
3. You run `pnpm build:registry` to update the registry.

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention `category(scope): message` in your commit message while using one of the following categories:

- `feat / feature`: all changes that introduce completely new code or new features
- `fix`: changes that fix a bug (ideally you will additionally reference an issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for usage of a lib or cli usage)
- `build`: all changes regarding the build of the software, changes to dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e. GitHub Actions, CI system)
- `chore`: all changes to the repository that do not fit into any of the above categories

e.g. `feat(cli): add search command`

If you are interested in the detailed specification you can visit https://www.conventionalcommits.org/

## Requests for new employees

If you have a request for a new AI employee, please open a discussion on GitHub. We'll be happy to help you out.

## CLI

The `@the-aico/cli` package is a CLI for adding AI employees to your project. You can find the documentation for the CLI [here](https://the-aico.com/docs/cli).

Any changes to the CLI should be made in the `packages/cli` directory. If you can, it would be great if you could add tests for your changes.

## Testing

Tests are written using [Vitest](https://vitest.dev). You can run all the tests from the root of the repository.

```bash
pnpm test
```

To run skill tests:

```bash
./tests/run-all.sh              # Run all skill tests
./tests/run-all.sh --fast       # Fast mode (content tests only)
./tests/run-all.sh --verbose    # Verbose output
```

Please ensure that the tests are passing when submitting a pull request. If you're adding new features, please include tests.
