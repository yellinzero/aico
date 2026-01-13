#!/usr/bin/env bash
# aico test configuration

# Get aico project root directory
AICO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Test output directory
TEST_OUTPUT_DIR="${TEST_OUTPUT_DIR:-/tmp/aico-tests}"

# Default timeout settings (seconds)
DEFAULT_TIMEOUT="${DEFAULT_TIMEOUT:-120}"
DEFAULT_MAX_TURNS="${DEFAULT_MAX_TURNS:-5}"

# Claude CLI options
CLAUDE_OPTIONS="${CLAUDE_OPTIONS:---dangerously-skip-permissions}"

# Employee list (only includes existing employees)
EMPLOYEES=(
    "pm"
    "frontend"
    "backend"
)

# Skill naming prefix
SKILL_PREFIX="aico"

# Generate full skill name
# Usage: full_skill_name "pm" "brainstorming" => "aico-pm-brainstorming"
full_skill_name() {
    local employee="$1"
    local skill="$2"
    echo "${SKILL_PREFIX}-${employee}-${skill}"
}

# Get all skills for an employee
# Usage: get_employee_skills "pm"
get_employee_skills() {
    local employee="$1"
    local employee_json="$AICO_ROOT/employees/$employee/employee.json"

    if [ -f "$employee_json" ]; then
        jq -r '.skills[].name' "$employee_json" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Colored output functions
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✖${NC} $1"; }

export AICO_ROOT
export TEST_OUTPUT_DIR
export DEFAULT_TIMEOUT
export DEFAULT_MAX_TURNS
export CLAUDE_OPTIONS
export EMPLOYEES
export SKILL_PREFIX
export RED GREEN YELLOW BLUE NC
export -f full_skill_name
export -f get_employee_skills
export -f log_info log_success log_warn log_error
