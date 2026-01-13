#!/bin/bash
# Run skill content tests
# Usage: ./run-skill-tests.sh --employee <name> [--verbose]
#        ./run-skill-tests.sh --all [--verbose]
#
# Test purpose: Verify that skill key requirements are correctly understood and described by Claude.
# By default, requires specifying an employee. Use --all to test all employees

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../lib/test-helpers.sh"

# macOS compatible timeout function
run_with_timeout() {
    local timeout_seconds="$1"
    shift
    if command -v timeout &> /dev/null; then
        timeout "$timeout_seconds" "$@"
    elif command -v gtimeout &> /dev/null; then
        gtimeout "$timeout_seconds" "$@"
    else
        # No timeout command available, run without timeout
        "$@"
    fi
}

# Extract employee name from test filename (test-{employee}-{skill}.sh -> employee)
get_employee_from_test() {
    local filename=$(basename "$1" .sh)
    # test-pm-brainstorming -> pm
    echo "$filename" | sed 's/^test-//' | cut -d'-' -f1
}

# Get available employee list
get_available_employees() {
    local employees=()
    for file in "$SCRIPT_DIR/skills"/test-*.sh; do
        if [ -f "$file" ]; then
            local emp=$(get_employee_from_test "$file")
            # Deduplicate
            if [[ ! " ${employees[*]} " =~ " $emp " ]]; then
                employees+=("$emp")
            fi
        fi
    done
    echo "${employees[*]}"
}

# Check Claude CLI
if ! command -v claude &> /dev/null; then
    log_error "Claude Code CLI not found"
    echo "Install Claude Code first: https://claude.ai/code"
    exit 1
fi

# Parse arguments
VERBOSE=false
SPECIFIC_TEST=""
SPECIFIC_EMPLOYEE=""
RUN_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --employee|-e)
            SPECIFIC_EMPLOYEE="$2"
            shift 2
            ;;
        --all|-a)
            RUN_ALL=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --test|-t)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --employee <name> [options]"
            echo "       $0 --all [options]"
            echo ""
            echo "Options:"
            echo "  --employee, -e NAME   Test specific employee (required unless --all)"
            echo "  --all, -a             Test ALL employees"
            echo "  --verbose, -v         Show verbose output"
            echo "  --test, -t NAME       Run only specific test file"
            echo "  --help, -h            Show this help"
            echo ""
            echo "Available employees: $(get_available_employees)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check arguments (unless specific test file is specified)
if [ -z "$SPECIFIC_TEST" ] && [ -z "$SPECIFIC_EMPLOYEE" ] && [ "$RUN_ALL" = false ]; then
    echo "Error: Please specify --employee <name> or use --all"
    echo "Available employees: $(get_available_employees)"
    exit 1
fi

print_test_header "Skill Content Tests"
echo "Repository: $AICO_ROOT"
echo "Test time: $(date)"
echo "Claude version: $(claude --version 2>/dev/null || echo 'not found')"
if [ -n "$SPECIFIC_EMPLOYEE" ]; then
    echo "Employee: $SPECIFIC_EMPLOYEE"
elif [ -n "$SPECIFIC_TEST" ]; then
    echo "Test: $SPECIFIC_TEST"
else
    echo "Testing: ALL employees"
fi
echo ""

# Build test list
tests=()
if [ -n "$SPECIFIC_TEST" ]; then
    tests=("$SPECIFIC_TEST")
else
    for file in "$SCRIPT_DIR/skills"/test-*.sh; do
        if [ -f "$file" ]; then
            local_file=$(basename "$file")
            # If employee is specified, only add matching tests
            if [ -n "$SPECIFIC_EMPLOYEE" ]; then
                file_employee=$(get_employee_from_test "$file")
                if [ "$file_employee" = "$SPECIFIC_EMPLOYEE" ]; then
                    tests+=("$local_file")
                fi
            else
                tests+=("$local_file")
            fi
        fi
    done
fi

# Statistics
passed=0
failed=0
skipped=0

for test in "${tests[@]}"; do
    echo "----------------------------------------"
    echo "Running: $test"
    echo "----------------------------------------"

    test_path="$SCRIPT_DIR/skills/$test"

    if [ ! -f "$test_path" ]; then
        log_warn "SKIP: Test file not found: $test"
        skipped=$((skipped + 1))
        continue
    fi

    if [ ! -x "$test_path" ]; then
        chmod +x "$test_path"
    fi

    start_time=$(date +%s)

    if [ "$VERBOSE" = true ]; then
        if run_with_timeout 300 bash "$test_path"; then
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            log_success "$test (${duration}s)"
            passed=$((passed + 1))
        else
            exit_code=$?
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            if [ $exit_code -eq 124 ]; then
                log_error "$test (timeout)"
            else
                log_error "$test (${duration}s)"
            fi
            failed=$((failed + 1))
        fi
    else
        if output=$(run_with_timeout 300 bash "$test_path" 2>&1); then
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            log_success "$test (${duration}s)"
            passed=$((passed + 1))
        else
            exit_code=$?
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            if [ $exit_code -eq 124 ]; then
                log_error "$test (timeout)"
            else
                log_error "$test (${duration}s)"
            fi
            echo ""
            echo "  Output:"
            echo "$output" | sed 's/^/    /'
            failed=$((failed + 1))
        fi
    fi

    echo ""
done

print_test_summary $passed $failed $skipped
