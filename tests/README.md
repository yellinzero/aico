# aico Skills Test Suite

Automated testing framework for validating aico employee skills effectiveness.

## Quick Start

```bash
# Run tests for a specific employee
./tests/run-all.sh pm

# Run all tests (use with caution - many Claude calls)
./tests/run-all.sh --all

# Fast test (skill content only)
./tests/run-all.sh pm --fast

# Verbose output
./tests/run-all.sh pm --verbose

# Preview tests without running (dry run)
./tests/run-all.sh --all --dry-run

# Run specific test suite
./tests/run-all.sh pm --suite skill-triggering
```

## Test Types

### 1. Skill Triggering Tests (skill-triggering)

Verify that Claude can automatically trigger the correct skill based on natural language prompts.

```bash
# Run all triggering tests for an employee
./tests/skill-triggering/run-all.sh --employee pm

# Run a single test
./tests/skill-triggering/run-test.sh pm brainstorming ./tests/skill-triggering/prompts/pm/brainstorming.txt
```

**Test Logic**:

1. Give Claude a natural language prompt (without mentioning skill name)
2. Verify Claude calls the expected Skill tool
3. Record success/failure

### 2. Explicit Request Tests (explicit-skill-requests)

Verify that skills load correctly when users explicitly request them.

```bash
# Run all explicit request tests for an employee
./tests/explicit-skill-requests/run-all.sh --employee pm

# Run a single test
./tests/explicit-skill-requests/run-test.sh aico-pm-brainstorming ./tests/explicit-skill-requests/prompts/use-aico-pm-brainstorming.txt
```

**Additional Checks**:

- Whether skill was triggered
- Whether there was "premature action" (starting work before loading skill)

### 3. Skill Content Tests (skill-content)

Verify that skill key requirements are correctly understood by Claude.

```bash
# Run all content tests for an employee
./tests/skill-content/run-skill-tests.sh --employee pm

# Run a specific test
./tests/skill-content/run-skill-tests.sh --test test-pm-brainstorming.sh
```

## Directory Structure

```
tests/
├── README.md                       # This document
├── run-all.sh                      # Main test runner
│
├── lib/                            # Test library
│   ├── test-config.sh              # Configuration
│   ├── test-helpers.sh             # Utility functions
│   └── cost-estimation.sh          # Cost estimation utilities
│
├── skill-triggering/               # Auto-triggering tests
│   ├── run-test.sh                 # Single test runner
│   ├── run-all.sh                  # Batch runner
│   └── prompts/                    # Test prompts
│       ├── pm/
│       │   ├── init.txt
│       │   ├── brainstorming.txt
│       │   ├── prd-writing.txt
│       │   ├── user-story-writing.txt
│       │   ├── clarification.txt
│       │   ├── acceptance-criteria.txt
│       │   ├── competitor-analysis.txt
│       │   └── story-acceptance.txt
│       ├── frontend/
│       │   ├── init.txt
│       │   ├── design.txt
│       │   ├── style-extraction.txt
│       │   ├── implement.txt
│       │   ├── plan.txt
│       │   └── task-breakdown.txt
│       └── backend/
│           ├── init.txt
│           ├── implement.txt
│           ├── plan.txt
│           └── task-breakdown.txt
│
├── explicit-skill-requests/        # Explicit request tests
│   ├── run-test.sh
│   ├── run-all.sh
│   └── prompts/
│       ├── use-aico-pm-init.txt
│       ├── use-aico-pm-brainstorming.txt
│       ├── use-aico-frontend-init.txt
│       ├── use-aico-frontend-design.txt
│       ├── use-aico-backend-init.txt
│       ├── use-aico-backend-implement.txt
│       └── ...
│
└── skill-content/                  # Skill content tests
    ├── run-skill-tests.sh
    └── skills/
        ├── test-pm-brainstorming.sh
        ├── test-pm-prd-writing.sh
        ├── test-pm-user-story-writing.sh
        ├── test-frontend-design.sh
        ├── test-frontend-implement.sh
        ├── test-backend-implement.sh
        └── test-backend-tdd.sh
```

## Utility Functions

`lib/test-helpers.sh` provides the following functions:

| Function                                       | Purpose                               |
| ---------------------------------------------- | ------------------------------------- |
| `run_claude "prompt" [timeout] [max_turns]`    | Run Claude and return output          |
| `assert_skill_triggered "output" "skill-name"` | Verify skill was triggered            |
| `assert_contains "output" "pattern"`           | Verify output contains pattern        |
| `assert_not_contains "output" "pattern"`       | Verify output doesn't contain pattern |
| `assert_no_premature_action "output"`          | Verify no premature action            |
| `list_triggered_skills "output"`               | List all triggered skills             |
| `create_test_project`                          | Create temporary test project         |
| `cleanup_test_project "$dir"`                  | Cleanup test project                  |

## Adding New Tests

### Adding Skill Triggering Tests

1. Create prompt file: `tests/skill-triggering/prompts/{employee}/{skill}.txt`
2. Run test: `./tests/skill-triggering/run-test.sh {employee} {skill} {prompt-file}`

### Adding Explicit Request Tests

1. Create prompt file: `tests/explicit-skill-requests/prompts/use-{skill-name}.txt`
2. Filename format: `use-aico-{employee}-{skill}.txt`

### Adding Skill Content Tests

1. Create test script: `tests/skill-content/skills/test-{employee}-{skill}.sh`
2. Use `assert_contains` to verify key elements
3. Add to test list in `run-skill-tests.sh`

## Test Coverage

| Employee     | Skill               | Triggering | Explicit | Content |
| ------------ | ------------------- | ---------- | -------- | ------- |
| **PM**       |                     |            |          |         |
|              | init                | ✅         | ✅       | -       |
|              | brainstorming       | ✅         | ✅       | ✅      |
|              | prd-writing         | ✅         | ✅       | ✅      |
|              | user-story-writing  | ✅         | ✅       | ✅      |
|              | clarification       | ✅         | ✅       | -       |
|              | acceptance-criteria | ✅         | ✅       | -       |
|              | competitor-analysis | ✅         | ✅       | -       |
|              | story-acceptance    | ✅         | ✅       | -       |
| **Frontend** |                     |            |          |         |
|              | init                | ✅         | ✅       | -       |
|              | design              | ✅         | ✅       | ✅      |
|              | style-extraction    | ✅         | ✅       | -       |
|              | implement           | ✅         | ✅       | ✅      |
|              | plan                | ✅         | ✅       | -       |
|              | task-breakdown      | ✅         | ✅       | -       |
| **Backend**  |                     |            |          |         |
|              | init                | ✅         | ✅       | -       |
|              | implement           | ✅         | ✅       | ✅      |
|              | plan                | ✅         | ✅       | -       |
|              | task-breakdown      | ✅         | ✅       | -       |
|              | tdd                 | -          | -        | ✅      |

## CI/CD Integration

```bash
# Run in CI (fast mode for single employee)
./tests/run-all.sh pm --fast

# With timeout control
timeout 1800 ./tests/run-all.sh --all
```

Exit codes:

- `0`: All tests passed
- `1`: Some tests failed

## Cost Estimation

The test framework includes cost estimation based on [LiteLLM](https://github.com/BerriAI/litellm) pricing data.

### View Cost Estimates

```bash
# Preview cost for all tests
./tests/run-all.sh --all --dry-run

# Preview cost for single employee
./tests/run-all.sh pm --dry-run
```

### Pricing Reference (per million tokens)

| Model            | Input | Output | Cache Read |
| ---------------- | ----- | ------ | ---------- |
| Claude Sonnet 4  | $3    | $15    | $0.3       |
| Claude Opus 4.5  | $5    | $25    | $0.5       |
| Claude Haiku 3.5 | $0.8  | $4     | $0.08      |

### Estimated Costs

| Test Scope   | Tests | Haiku  | Sonnet | Opus   |
| ------------ | ----- | ------ | ------ | ------ |
| --all (full) | 47    | ~$0.50 | ~$1.80 | ~$3.00 |
| pm (single)  | 17    | ~$0.18 | ~$0.66 | ~$1.10 |
| --fast       | 3-7   | ~$0.03 | ~$0.12 | ~$0.20 |

> Cost estimates based on typical test scenario (~5200 input tokens, ~1500 output tokens, ~3000 cached tokens)

## Debugging

Use `--verbose` to see detailed output:

```bash
./tests/run-all.sh pm --verbose
```

Test output is saved to `/tmp/aico-tests/{timestamp}/`.
