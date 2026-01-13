#!/usr/bin/env bash
# Test PM PRD Writing skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "PM PRD Writing Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-pm-prd-writing skill do? What sections does a PRD typically include?" 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. PRD structure
if ! assert_contains "$output" "section\|structure" "Mentions document structure"; then
    FAILED=1
fi

# 2. Problem/background
if ! assert_contains "$output" "problem\|background\|context" "Mentions problem/background"; then
    FAILED=1
fi

# 3. Goals/objectives
if ! assert_contains "$output" "goal\|objective" "Mentions goals/objectives"; then
    FAILED=1
fi

# 4. Features/requirements
if ! assert_contains "$output" "feature\|requirement" "Mentions features/requirements"; then
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
