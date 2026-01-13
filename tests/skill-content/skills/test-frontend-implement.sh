#!/usr/bin/env bash
# Test Frontend Implement skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "Frontend Implement Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-frontend-implement skill do? What are its key principles?" 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. Design constraints
if ! assert_contains "$output" "constraint\|design" "Mentions design constraints"; then
    FAILED=1
fi

# 2. Component implementation
if ! assert_contains "$output" "component" "Mentions component implementation"; then
    FAILED=1
fi

# 3. Code/implementation
if ! assert_contains "$output" "code\|implement" "Mentions code implementation"; then
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
