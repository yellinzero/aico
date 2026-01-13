#!/usr/bin/env bash
# Test PM Brainstorming skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "PM Brainstorming Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-pm-brainstorming skill do? Describe its key features and workflow." 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. Asking questions
if ! assert_contains "$output" "question" "Mentions asking questions"; then
    FAILED=1
fi

# 2. One question at a time
if ! assert_contains "$output" "one.*time\|single" "Mentions one question at a time"; then
    FAILED=1
fi

# 3. Exploring multiple approaches
if ! assert_contains "$output" "approach\|alternative\|option" "Mentions exploring approaches"; then
    FAILED=1
fi

# 4. Validation/confirmation
if ! assert_contains "$output" "validate\|confirm" "Mentions validation"; then
    FAILED=1
fi

# 5. From vague to clear
if ! assert_contains "$output" "vague\|unclear\|clear\|actionable" "Mentions transforming vague to clear"; then
    FAILED=1
fi

if [ $FAILED -eq 0 ]; then
    echo ""
    log_success "All skill content tests passed"
    exit 0
else
    echo ""
    log_error "Some skill content tests failed"
    exit 1
fi
