#!/usr/bin/env bash
# Test Backend Implement skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "Backend Implement Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-backend-implement skill do? What are its key principles?" 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. API/backend
if ! assert_contains "$output" "API\|backend" "Mentions API/backend"; then
    FAILED=1
fi

# 2. Constraints/standards
if ! assert_contains "$output" "constraint\|standard" "Mentions constraints/standards"; then
    FAILED=1
fi

# 3. Implementation
if ! assert_contains "$output" "implement\|code" "Mentions implementation"; then
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
