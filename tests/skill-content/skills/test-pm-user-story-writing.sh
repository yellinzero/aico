#!/usr/bin/env bash
# Test PM User Story Writing skill content
# Verify that skill key elements are correctly understood by Claude

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../lib/test-helpers.sh"

print_test_header "PM User Story Writing Skill Content Test"

# Ask Claude about the skill content
output=$(run_claude "What does the aico-pm-user-story-writing skill do? What format does it use?" 120)

echo "Claude's response:"
echo "---"
echo "$output" | head -50
echo "---"
echo ""

FAILED=0

# Verify key elements

# 1. "As a ... I want ... So that" format
if ! assert_contains "$output" "As a" "Mentions 'As a' story format"; then
    FAILED=1
fi

# 2. Acceptance criteria
if ! assert_contains "$output" "acceptance\|criteria" "Mentions acceptance criteria"; then
    FAILED=1
fi

# 3. User story
if ! assert_contains "$output" "story" "Mentions user story"; then
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
