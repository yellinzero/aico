#!/bin/bash
# Run skill triggering tests
# Usage: ./run-all.sh --employee <name> [--verbose]
#        ./run-all.sh --all [--verbose]
#
# By default, requires specifying an employee. Use --all to test all employees

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-helpers.sh"

# Get available employee list
get_available_employees() {
    local employees=()
    if [ -d "$SCRIPT_DIR/prompts" ]; then
        for dir in "$SCRIPT_DIR/prompts"/*/; do
            if [ -d "$dir" ]; then
                employees+=("$(basename "$dir")")
            fi
        done
    fi
    echo "${employees[*]}"
}

# Parse arguments
VERBOSE=false
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
        --help|-h)
            echo "Usage: $0 --employee <name> [options]"
            echo "       $0 --all [options]"
            echo ""
            echo "Options:"
            echo "  --employee, -e NAME   Test specific employee (required unless --all)"
            echo "  --all, -a             Test ALL employees"
            echo "  --verbose, -v         Show verbose output"
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

# Check arguments
if [ -z "$SPECIFIC_EMPLOYEE" ] && [ "$RUN_ALL" = false ]; then
    echo "Error: Please specify --employee <name> or use --all"
    echo "Available employees: $(get_available_employees)"
    exit 1
fi

# Determine which employees to test
if [ "$RUN_ALL" = true ]; then
    EMPLOYEES_TO_TEST=($(get_available_employees))
else
    EMPLOYEES_TO_TEST=("$SPECIFIC_EMPLOYEE")
fi

print_test_header "Skill Triggering Tests"
echo "Employees to test: ${EMPLOYEES_TO_TEST[*]}"
echo ""

PASSED=0
FAILED=0
SKIPPED=0
RESULTS=()

for employee in "${EMPLOYEES_TO_TEST[@]}"; do
    PROMPTS_DIR="$SCRIPT_DIR/prompts/$employee"

    if [ ! -d "$PROMPTS_DIR" ]; then
        log_warn "SKIP: No prompts directory for $employee"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Iterate through all prompt files for this employee
    for prompt_file in "$PROMPTS_DIR"/*.txt; do
        if [ ! -f "$prompt_file" ]; then
            continue
        fi

        # Extract skill name from filename
        skill_name=$(basename "$prompt_file" .txt)

        echo "Testing: $employee / $skill_name"

        if [ "$VERBOSE" = true ]; then
            if "$SCRIPT_DIR/run-test.sh" "$employee" "$skill_name" "$prompt_file" 5; then
                PASSED=$((PASSED + 1))
                RESULTS+=("✅ $employee/$skill_name")
            else
                FAILED=$((FAILED + 1))
                RESULTS+=("❌ $employee/$skill_name")
            fi
        else
            if output=$("$SCRIPT_DIR/run-test.sh" "$employee" "$skill_name" "$prompt_file" 5 2>&1); then
                log_success "$employee/$skill_name"
                PASSED=$((PASSED + 1))
                RESULTS+=("✅ $employee/$skill_name")
            else
                log_error "$employee/$skill_name"
                echo "$output" | tail -20 | sed 's/^/    /'
                FAILED=$((FAILED + 1))
                RESULTS+=("❌ $employee/$skill_name")
            fi
        fi

        echo ""
    done
done

echo ""
echo "=== Results ==="
for result in "${RESULTS[@]}"; do
    echo "  $result"
done

print_test_summary $PASSED $FAILED $SKIPPED
