#!/usr/bin/env bash
# Test Frontend Design skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "Frontend Design Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-frontend-design skill do? What outputs does it produce?" 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. User flow
if ! assert_contains "$output" "flow\|interaction" "Mentions user flow/interaction"; then
    FAILED=1
fi

# 2. Layout
if ! assert_contains "$output" "layout\|ASCII" "Mentions layout"; then
    FAILED=1
fi

# 3. Components
if ! assert_contains "$output" "component" "Mentions components"; then
    FAILED=1
fi

# 4. PRD/requirements as input
if ! assert_contains "$output" "PRD\|requirement" "Mentions PRD/requirements as input"; then
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
