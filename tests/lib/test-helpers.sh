#!/usr/bin/env bash
# aico skill test utility functions

_HELPERS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$_HELPERS_DIR/test-config.sh"

# macOS compatible timeout function
_run_with_timeout() {
    local timeout_seconds="$1"
    shift
    if command -v timeout &> /dev/null; then
        timeout "$timeout_seconds" "$@"
    elif command -v gtimeout &> /dev/null; then
        gtimeout "$timeout_seconds" "$@"
    else
        # No timeout command available, run without timeout
        "$@"
    fi
}

# Run Claude Code and capture output
# Usage: run_claude "prompt" [timeout] [max_turns]
run_claude() {
    local prompt="$1"
    local timeout="${2:-$DEFAULT_TIMEOUT}"
    local max_turns="${3:-$DEFAULT_MAX_TURNS}"
    local output_file=$(mktemp)

    _run_with_timeout "$timeout" claude -p "$prompt" \
        $CLAUDE_OPTIONS \
        --max-turns "$max_turns" \
        --verbose \
        --output-format stream-json \
        > "$output_file" 2>&1 || true

    cat "$output_file"
    rm -f "$output_file"
}

# Run Claude Code and save to specified file
# Usage: run_claude_to_file "prompt" "output_file" [timeout] [max_turns]
run_claude_to_file() {
    local prompt="$1"
    local output_file="$2"
    local timeout="${3:-$DEFAULT_TIMEOUT}"
    local max_turns="${4:-$DEFAULT_MAX_TURNS}"

    _run_with_timeout "$timeout" claude -p "$prompt" \
        $CLAUDE_OPTIONS \
        --max-turns "$max_turns" \
        --verbose \
        --output-format stream-json \
        > "$output_file" 2>&1 || true

    cat "$output_file"
}

# Check if skill was triggered
# Usage: assert_skill_triggered "output" "skill-name" "test name"
assert_skill_triggered() {
    local output="$1"
    local skill_name="$2"
    local test_name="${3:-Skill triggered}"

    # Match "skill":"skillname" or "skill":"namespace:skillname"
    local skill_pattern='"skill":"([^"]*:)?'"${skill_name}"'"'

    if echo "$output" | grep -q '"name":"Skill"' && \
       echo "$output" | grep -qE "$skill_pattern"; then
        log_success "$test_name - Skill '$skill_name' triggered"
        return 0
    else
        log_error "$test_name - Skill '$skill_name' NOT triggered"
        return 1
    fi
}

# Check if skill was NOT triggered
# Usage: assert_skill_not_triggered "output" "skill-name" "test name"
assert_skill_not_triggered() {
    local output="$1"
    local skill_name="$2"
    local test_name="${3:-Skill not triggered}"

    local skill_pattern='"skill":"([^"]*:)?'"${skill_name}"'"'

    if echo "$output" | grep -qE "$skill_pattern"; then
        log_error "$test_name - Skill '$skill_name' was triggered unexpectedly"
        return 1
    else
        log_success "$test_name - Skill '$skill_name' correctly not triggered"
        return 0
    fi
}

# Check if output contains pattern (case insensitive)
# Usage: assert_contains "output" "pattern" "test name"
assert_contains() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-Contains pattern}"

    if echo "$output" | grep -qi "$pattern"; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name - Expected to find: $pattern"
        return 1
    fi
}

# Check if output contains pattern (case sensitive)
# Usage: assert_contains_exact "output" "pattern" "test name"
assert_contains_exact() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-Contains pattern (exact)}"

    if echo "$output" | grep -q "$pattern"; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name - Expected to find: $pattern"
        return 1
    fi
}

# Check if output does NOT contain pattern
# Usage: assert_not_contains "output" "pattern" "test name"
assert_not_contains() {
    local output="$1"
    local pattern="$2"
    local test_name="${3:-Does not contain pattern}"

    if echo "$output" | grep -qi "$pattern"; then
        log_error "$test_name - Unexpected pattern found: $pattern"
        return 1
    else
        log_success "$test_name"
        return 0
    fi
}

# Check pattern occurrence count
# Usage: assert_count "output" "pattern" expected_count "test name"
assert_count() {
    local output="$1"
    local pattern="$2"
    local expected="$3"
    local test_name="${4:-Pattern count}"

    local actual=$(echo "$output" | grep -c "$pattern" || echo "0")

    if [ "$actual" -eq "$expected" ]; then
        log_success "$test_name (found $actual instances)"
        return 0
    else
        log_error "$test_name - Expected $expected, found $actual instances of: $pattern"
        return 1
    fi
}

# Check if pattern A appears before pattern B
# Usage: assert_order "output" "pattern_a" "pattern_b" "test name"
assert_order() {
    local output="$1"
    local pattern_a="$2"
    local pattern_b="$3"
    local test_name="${4:-Pattern order}"

    local line_a=$(echo "$output" | grep -n "$pattern_a" | head -1 | cut -d: -f1)
    local line_b=$(echo "$output" | grep -n "$pattern_b" | head -1 | cut -d: -f1)

    if [ -z "$line_a" ]; then
        log_error "$test_name - Pattern A not found: $pattern_a"
        return 1
    fi

    if [ -z "$line_b" ]; then
        log_error "$test_name - Pattern B not found: $pattern_b"
        return 1
    fi

    if [ "$line_a" -lt "$line_b" ]; then
        log_success "$test_name (A at line $line_a, B at line $line_b)"
        return 0
    else
        log_error "$test_name - Expected '$pattern_a' before '$pattern_b'"
        return 1
    fi
}

# Check for premature action (using other tools before skill is loaded)
# Usage: assert_no_premature_action "output" "test name"
assert_no_premature_action() {
    local output="$1"
    local test_name="${2:-No premature action}"

    local first_skill_line=$(echo "$output" | grep -n '"name":"Skill"' | head -1 | cut -d: -f1)

    if [ -z "$first_skill_line" ]; then
        log_error "$test_name - No Skill invocation found"
        return 1
    fi

    # Check if there are other tool calls before Skill call (excluding non-destructive tools)
    local premature=$(echo "$output" | head -n "$first_skill_line" | \
        grep '"type":"tool_use"' | \
        grep -v '"name":"Skill"' | \
        grep -v '"name":"TodoWrite"' | \
        grep -v '"name":"Read"' | \
        grep -v '"name":"Glob"' | \
        grep -v '"name":"Grep"' || true)

    if [ -n "$premature" ]; then
        log_error "$test_name - Premature tool use before Skill"
        echo "  Premature tools:" >&2
        echo "$premature" | head -5 | sed 's/^/    /' >&2
        return 1
    else
        log_success "$test_name"
        return 0
    fi
}

# List all triggered skills
# Usage: list_triggered_skills "output"
list_triggered_skills() {
    local output="$1"
    echo "$output" | grep -o '"skill":"[^"]*"' | sort -u | sed 's/"skill":"//g; s/"//g' || echo "(none)"
}

# Get text content of first assistant response
# Usage: get_first_response "output"
get_first_response() {
    local output="$1"
    echo "$output" | grep '"type":"assistant"' | head -1 | \
        jq -r '.message.content[0].text // .message.content' 2>/dev/null | \
        head -c 1000 || echo "(could not extract)"
}

# Create temporary test project
# Usage: test_dir=$(create_test_project)
create_test_project() {
    # Use sandbox directory within project so Claude can access .claude/skills
    local sandbox_base="$AICO_ROOT/tests/.sandbox"
    local test_id=$(date +%s)-$$-$RANDOM
    local test_dir="$sandbox_base/$test_id"

    mkdir -p "$test_dir/.claude/skills"
    mkdir -p "$test_dir/.claude/commands"
    mkdir -p "$test_dir/docs/plans"
    mkdir -p "$test_dir/docs/reference"

    # Create aico.json
    cat > "$test_dir/aico.json" << 'EOF'
{
  "$schema": "https://the-aico.com/schema/config.json",
  "defaultPlatform": "claude-code",
  "platforms": {
    "claude-code": {
      "skills": ".claude/skills",
      "commands": ".claude/commands",
      "docs": "docs/reference"
    }
  },
  "employees": {},
  "registries": {
    "@the-aico": "https://the-aico.com/r/{name}.json"
  }
}
EOF

    echo "$test_dir"
}

# Create test project with sample content
# Usage: test_dir=$(create_test_project_with_content)
create_test_project_with_content() {
    local test_dir=$(create_test_project)

    # Create sample plan file
    cat > "$test_dir/docs/plans/example-plan.md" << 'EOF'
# Example Implementation Plan

## Task 1: Create User Model
Create a basic user model with email and password fields.

## Task 2: Add Authentication
Implement login and register endpoints.

## Task 3: Add Authorization
Protect routes with JWT validation.
EOF

    # Create sample requirements file
    cat > "$test_dir/docs/requirements.md" << 'EOF'
# Product Requirements

## Overview
Build a user authentication system.

## Features
- User registration
- User login
- Password reset
EOF

    echo "$test_dir"
}

# Cleanup test project
# Usage: cleanup_test_project "$test_dir"
cleanup_test_project() {
    local test_dir="$1"
    [ -d "$test_dir" ] && rm -rf "$test_dir"
}

# Create test output directory
# Usage: output_dir=$(create_output_dir "skill-triggering" "pm" "brainstorming")
create_output_dir() {
    local test_type="$1"
    local employee="${2:-}"
    local skill="${3:-}"
    local timestamp=$(date +%s)

    local output_dir="$TEST_OUTPUT_DIR/$timestamp/$test_type"
    [ -n "$employee" ] && output_dir="$output_dir/$employee"
    [ -n "$skill" ] && output_dir="$output_dir/$skill"

    mkdir -p "$output_dir"
    echo "$output_dir"
}

# Print test header
# Usage: print_test_header "Test Name"
print_test_header() {
    local test_name="$1"
    echo ""
    echo "========================================"
    echo " $test_name"
    echo "========================================"
    echo ""
}

# Print test separator
# Usage: print_test_separator
print_test_separator() {
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Print test summary
# Usage: print_test_summary passed failed skipped
print_test_summary() {
    local passed="$1"
    local failed="$2"
    local skipped="${3:-0}"

    echo ""
    echo "========================================"
    echo " Test Results Summary"
    echo "========================================"
    echo ""
    echo "  Passed:  $passed"
    echo "  Failed:  $failed"
    echo "  Skipped: $skipped"
    echo ""

    if [ "$failed" -gt 0 ]; then
        echo "STATUS: FAILED"
        return 1
    else
        echo "STATUS: PASSED"
        return 0
    fi
}

export -f run_claude
export -f run_claude_to_file
export -f assert_skill_triggered
export -f assert_skill_not_triggered
export -f assert_contains
export -f assert_contains_exact
export -f assert_not_contains
export -f assert_count
export -f assert_order
export -f assert_no_premature_action
export -f list_triggered_skills
export -f get_first_response
export -f create_test_project
export -f create_test_project_with_content
export -f cleanup_test_project
export -f create_output_dir
export -f print_test_header
export -f print_test_separator
export -f print_test_summary
