#!/usr/bin/env bash
# Test Backend TDD skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "Backend TDD Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-backend-tdd skill do? What is its workflow?" 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. TDD / test-driven
if ! assert_contains "$output" "TDD\|test.*driven" "Mentions TDD/test-driven"; then
    FAILED=1
fi

# 2. Test first
if ! assert_contains "$output" "test.*first\|write.*test" "Mentions test-first"; then
    FAILED=1
fi

# 3. Red-Green-Refactor
if ! assert_contains "$output" "red.*green\|refactor" "Mentions red-green-refactor"; then
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
