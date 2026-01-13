#!/bin/bash
# Test skill auto-triggering
# Usage: ./run-test.sh <employee> <skill-name> <prompt-file> [max-turns]
#
# Test purpose: Verify that when users describe problems in natural language,
# Claude can correctly identify and automatically trigger the corresponding Skill.

set -e

EMPLOYEE="$1"
SKILL_NAME="$2"
PROMPT_FILE="$3"
MAX_TURNS="${4:-5}"

if [ -z "$EMPLOYEE" ] || [ -z "$SKILL_NAME" ] || [ -z "$PROMPT_FILE" ]; then
    echo "Usage: $0 <employee> <skill-name> <prompt-file> [max-turns]"
    echo ""
    echo "Example:"
    echo "  $0 pm brainstorming ./prompts/pm/brainstorming.txt"
    echo "  $0 designer design ./prompts/designer/design.txt 3"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-helpers.sh"

# Full skill name
FULL_SKILL_NAME=$(full_skill_name "$EMPLOYEE" "$SKILL_NAME")

# Create output directory
OUTPUT_DIR=$(create_output_dir "skill-triggering" "$EMPLOYEE" "$SKILL_NAME")
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

print_test_header "Skill Triggering Test"
echo "Employee:    $EMPLOYEE"
echo "Skill:       $SKILL_NAME"
echo "Full name:   $FULL_SKILL_NAME"
echo "Max turns:   $MAX_TURNS"
echo "Sandbox:     $SANDBOX_REL_PATH"
echo "Prompt file: $PROMPT_FILE"
echo "Output dir:  $OUTPUT_DIR"
echo ""
echo "Prompt:"
echo "---"
echo "$PROMPT" | head -10
echo "---"
echo ""

# Copy prompt for reference
cp "$PROMPT_FILE" "$OUTPUT_DIR/prompt.txt"

# Run Claude from project root (so it can access .claude/skills)
cd "$AICO_ROOT"

log_info "Running Claude with natural prompt..."
output=$(run_claude_to_file "$SANDBOX_PROMPT" "$LOG_FILE" 300 "$MAX_TURNS")

print_test_separator
echo "=== Results ==="
echo ""

# Check if skill was triggered
if assert_skill_triggered "$output" "$FULL_SKILL_NAME" "Skill triggered"; then
    echo ""
    log_success "PASS: Skill '$FULL_SKILL_NAME' was triggered"
    RESULT=0
else
    echo ""
    log_error "FAIL: Skill '$FULL_SKILL_NAME' was NOT triggered"
    RESULT=1
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

exit $RESULT
