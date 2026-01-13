#!/bin/bash
# Test explicit skill requests
# Usage: ./run-test.sh <skill-name> <prompt-file> [max-turns]
#
# Test purpose: Verify that when users explicitly request a skill,
# Claude correctly invokes it and doesn't start working before loading the skill.

set -e

SKILL_NAME="$1"
PROMPT_FILE="$2"
MAX_TURNS="${3:-5}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
    echo "Usage: $0 <skill-name> <prompt-file> [max-turns]"
    echo ""
    echo "Example:"
    echo "  $0 aico-pm-brainstorming ./prompts/use-brainstorming.txt"
    echo "  $0 aico-designer-design ./prompts/use-design.txt 3"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-helpers.sh"

# Create output directory
OUTPUT_DIR=$(create_output_dir "explicit-requests" "" "$SKILL_NAME")
LOG_FILE="$OUTPUT_DIR/claude-output.json"

# Read prompt
if [ ! -f "$PROMPT_FILE" ]; then
    log_error "Prompt file not found: $PROMPT_FILE"
    exit 1
fi
PROMPT=$(cat "$PROMPT_FILE")

# Create test sandbox and get relative path
PROJECT_DIR=$(create_test_project_with_content)
SANDBOX_REL_PATH="${PROJECT_DIR#$AICO_ROOT/}"

# Add sandbox restriction to prompt
SANDBOX_PROMPT="IMPORTANT: This is a test. You MUST only read/write files within the sandbox directory: $SANDBOX_REL_PATH

$PROMPT"

print_test_header "Explicit Skill Request Test"
echo "Skill:       $SKILL_NAME"
echo "Max turns:   $MAX_TURNS"
echo "Prompt file: $PROMPT_FILE"
echo "Sandbox:     $SANDBOX_REL_PATH"
echo "Output dir:  $OUTPUT_DIR"
echo ""
echo "Prompt:"
echo "---"
echo "$PROMPT"
echo "---"
echo ""

# Copy prompt for reference
cp "$PROMPT_FILE" "$OUTPUT_DIR/prompt.txt"

# Run Claude from project root (so it can access .claude/skills)
cd "$AICO_ROOT"

log_info "Running Claude with explicit skill request..."
output=$(run_claude_to_file "$SANDBOX_PROMPT" "$LOG_FILE" 300 "$MAX_TURNS")

print_test_separator
echo "=== Results ==="
echo ""

PASSED=true

# Check 1: Was skill triggered?
if ! assert_skill_triggered "$output" "$SKILL_NAME" "Skill triggered"; then
    PASSED=false
fi

# Check 2: Was there premature action?
if ! assert_no_premature_action "$output" "No premature action"; then
    PASSED=false
fi

echo ""
echo "All skills triggered in this run:"
list_triggered_skills "$output" | sed 's/^/  - /'

echo ""
echo "First response (truncated):"
get_first_response "$output" | head -c 500

# Cleanup sandbox
cleanup_test_project "$PROJECT_DIR"

echo ""
echo ""
echo "Full log: $LOG_FILE"

if [ "$PASSED" = true ]; then
    log_success "PASS: Explicit skill request test passed"
    exit 0
else
    log_error "FAIL: Explicit skill request test failed"
    exit 1
fi
