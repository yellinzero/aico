#!/bin/bash
# Run explicit skill request tests
# Usage: ./run-all.sh --employee <name> [--verbose]
#        ./run-all.sh --all [--verbose]
#
# By default, requires specifying an employee. Use --all to test all employees

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-helpers.sh"

# Extract employee name from filename (use-aico-{employee}-{skill}.txt -> employee)
get_employee_from_file() {
    local filename=$(basename "$1" .txt)
    # use-aico-pm-brainstorming -> pm
    echo "$filename" | sed 's/^use-aico-//' | cut -d'-' -f1
}

# Get available employee list
get_available_employees() {
    local employees=()
    for file in "$SCRIPT_DIR/prompts"/*.txt; do
        if [ -f "$file" ]; then
            local emp=$(get_employee_from_file "$file")
            # Deduplicate
            if [[ ! " ${employees[*]} " =~ " $emp " ]]; then
                employees+=("$emp")
            fi
        fi
    done
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

print_test_header "Explicit Skill Request Tests"
if [ -n "$SPECIFIC_EMPLOYEE" ]; then
    echo "Employee: $SPECIFIC_EMPLOYEE"
else
    echo "Testing: ALL employees"
fi
echo ""

PASSED=0
FAILED=0
RESULTS=()

# Iterate through all prompt files
for prompt_file in "$SCRIPT_DIR/prompts"/*.txt; do
    if [ ! -f "$prompt_file" ]; then
        continue
    fi

    # Check if matches specified employee
    file_employee=$(get_employee_from_file "$prompt_file")
    if [ -n "$SPECIFIC_EMPLOYEE" ] && [ "$file_employee" != "$SPECIFIC_EMPLOYEE" ]; then
        continue
    fi

    # Extract skill name from filename
    skill_name=$(basename "$prompt_file" .txt | sed 's/^use-//')

    echo "Testing explicit request: $skill_name"

    if [ "$VERBOSE" = true ]; then
        if "$SCRIPT_DIR/run-test.sh" "$skill_name" "$prompt_file" 5; then
            PASSED=$((PASSED + 1))
            RESULTS+=("✅ $skill_name")
        else
            FAILED=$((FAILED + 1))
            RESULTS+=("❌ $skill_name")
        fi
    else
        if output=$("$SCRIPT_DIR/run-test.sh" "$skill_name" "$prompt_file" 5 2>&1); then
            log_success "$skill_name"
            PASSED=$((PASSED + 1))
            RESULTS+=("✅ $skill_name")
        else
            log_error "$skill_name"
            echo "$output" | tail -20 | sed 's/^/    /'
            FAILED=$((FAILED + 1))
            RESULTS+=("❌ $skill_name")
        fi
    fi

    echo ""
done

echo ""
echo "=== Results ==="
for result in "${RESULTS[@]}"; do
    echo "  $result"
done

print_test_summary $PASSED $FAILED
