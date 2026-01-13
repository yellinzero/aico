#!/usr/bin/env bash
# aico skill test suite main runner
# Usage: ./run-all.sh <employee> [options]
#        ./run-all.sh --all [options]
#
# By default, requires specifying an employee name to avoid accidentally executing many Claude calls
# Use --all to run tests for all employees

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-helpers.sh"
source "$SCRIPT_DIR/lib/cost-estimation.sh"

# Get available employee list
get_available_employees() {
    local employees=()
    # Get employee list from skill-triggering/prompts directory
    if [ -d "$SCRIPT_DIR/skill-triggering/prompts" ]; then
        for dir in "$SCRIPT_DIR/skill-triggering/prompts"/*/; do
            if [ -d "$dir" ]; then
                employees+=("$(basename "$dir")")
            fi
        done
    fi
    echo "${employees[*]}"
}

# Parse arguments
VERBOSE=false
FAST_MODE=false
DRY_RUN=false
SPECIFIC_SUITE=""
SPECIFIC_EMPLOYEE=""
RUN_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --fast)
            FAST_MODE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --suite|-s)
            SPECIFIC_SUITE="$2"
            shift 2
            ;;
        --all|-a)
            RUN_ALL=true
            shift
            ;;
        --help|-h)
            echo "aico Skill Test Suite"
            echo ""
            echo "Usage: $0 <employee> [options]"
            echo "       $0 --all [options]"
            echo ""
            echo "Arguments:"
            echo "  <employee>          Employee name to test (e.g., pm, frontend)"
            echo ""
            echo "Options:"
            echo "  --all, -a           Run tests for ALL employees (use with caution)"
            echo "  --verbose, -v       Show verbose output"
            echo "  --fast              Only run skill-content tests (fastest, ~7 Claude calls)"
            echo "  --dry-run           Show what tests would run without executing"
            echo "  --suite, -s NAME    Run specific test suite:"
            echo "                        skill-triggering"
            echo "                        explicit-skill-requests"
            echo "                        skill-content"
            echo "  --help, -h          Show this help"
            echo ""
            echo "Available employees: $(get_available_employees)"
            echo ""
            echo "Examples:"
            echo "  $0 pm               Test only PM employee"
            echo "  $0 frontend --fast  Fast test for frontend only"
            echo "  $0 --all --dry-run  Preview all tests without running"
            echo "  $0 --all            Test ALL employees (many Claude calls!)"
            echo ""
            echo "⚠️  Cost Estimation (using Sonnet 4):"
            echo "  - Full test (--all): ~47 tests, ~\$1.50-2.00"
            echo "  - Single employee:   ~10-15 tests, ~\$0.30-0.50"
            echo "  - Fast mode:         ~3-7 tests, ~\$0.10-0.20"
            echo ""
            echo "  Use --dry-run to see detailed cost breakdown"
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
        *)
            # Positional argument: employee name
            if [ -z "$SPECIFIC_EMPLOYEE" ]; then
                SPECIFIC_EMPLOYEE="$1"
            else
                echo "Error: Multiple employee names provided"
                exit 1
            fi
            shift
            ;;
    esac
done

# Check if employee or --all is specified
if [ -z "$SPECIFIC_EMPLOYEE" ] && [ "$RUN_ALL" = false ]; then
    echo "Error: Please specify an employee name or use --all"
    echo ""
    echo "Available employees: $(get_available_employees)"
    echo ""
    echo "Usage: $0 <employee> [options]"
    echo "       $0 --all [options]"
    echo ""
    echo "Use --help for more information"
    exit 1
fi

# Validate employee name
if [ -n "$SPECIFIC_EMPLOYEE" ]; then
    available=$(get_available_employees)
    if [[ ! " $available " =~ " $SPECIFIC_EMPLOYEE " ]]; then
        echo "Error: Unknown employee '$SPECIFIC_EMPLOYEE'"
        echo "Available employees: $available"
        exit 1
    fi
fi

print_test_header "aico Skill Test Suite"
echo "Repository: $AICO_ROOT"
echo "Test time:  $(date)"
if [ "$RUN_ALL" = true ]; then
    echo "Target:     ALL employees"
else
    echo "Target:     $SPECIFIC_EMPLOYEE"
fi
echo "Mode:       $([ "$FAST_MODE" = true ] && echo "Fast (skill-content only)" || echo "Full")"
echo ""

# Check Claude CLI
if ! command -v claude &> /dev/null; then
    log_error "Claude Code CLI not found"
    echo "Install Claude Code first: https://claude.ai/code"
    exit 1
fi
log_success "Claude CLI found: $(claude --version 2>/dev/null || echo 'unknown version')"
echo ""

# Get test suite runner path
get_suite_runner() {
    local suite="$1"
    case "$suite" in
        skill-content)
            echo "$SCRIPT_DIR/skill-content/run-skill-tests.sh"
            ;;
        skill-triggering)
            echo "$SCRIPT_DIR/skill-triggering/run-all.sh"
            ;;
        explicit-skill-requests)
            echo "$SCRIPT_DIR/explicit-skill-requests/run-all.sh"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Determine which suites to run
if [ -n "$SPECIFIC_SUITE" ]; then
    SUITES_TO_RUN="$SPECIFIC_SUITE"
elif [ "$FAST_MODE" = true ]; then
    SUITES_TO_RUN="skill-content"
else
    SUITES_TO_RUN="skill-content skill-triggering explicit-skill-requests"
fi

# Statistics
TOTAL_FAILED=0
RESULTS=""

# Dry-run mode: list tests without executing
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "========================================"
    echo " DRY RUN - Test Preview"
    echo "========================================"
    echo ""

    total_tests=0

    for suite in $SUITES_TO_RUN; do
        echo "Suite: $suite"

        case "$suite" in
            skill-triggering)
                if [ "$RUN_ALL" = true ]; then
                    employees=($(ls -1 "$SCRIPT_DIR/skill-triggering/prompts/" 2>/dev/null))
                else
                    employees=("$SPECIFIC_EMPLOYEE")
                fi
                for emp in "${employees[@]}"; do
                    count=$(ls -1 "$SCRIPT_DIR/skill-triggering/prompts/$emp/"*.txt 2>/dev/null | wc -l | tr -d ' ')
                    if [ "$count" -gt 0 ]; then
                        echo "  $emp: $count tests"
                        total_tests=$((total_tests + count))
                    fi
                done
                ;;
            explicit-skill-requests)
                if [ "$RUN_ALL" = true ]; then
                    count=$(ls -1 "$SCRIPT_DIR/explicit-skill-requests/prompts/"*.txt 2>/dev/null | wc -l | tr -d ' ')
                else
                    count=$(ls -1 "$SCRIPT_DIR/explicit-skill-requests/prompts/use-aico-$SPECIFIC_EMPLOYEE-"*.txt 2>/dev/null | wc -l | tr -d ' ')
                fi
                echo "  $count tests"
                total_tests=$((total_tests + count))
                ;;
            skill-content)
                if [ "$RUN_ALL" = true ]; then
                    count=$(ls -1 "$SCRIPT_DIR/skill-content/skills/"*.sh 2>/dev/null | wc -l | tr -d ' ')
                else
                    count=$(ls -1 "$SCRIPT_DIR/skill-content/skills/test-$SPECIFIC_EMPLOYEE-"*.sh 2>/dev/null | wc -l | tr -d ' ')
                fi
                echo "  $count tests"
                total_tests=$((total_tests + count))
                ;;
        esac
        echo ""
    done

    echo "========================================"
    echo " Summary"
    echo "========================================"
    echo "Total tests: $total_tests"
    echo ""

    # Use cost estimation library
    echo "Cost estimates by model:"
    echo "  Haiku 3.5:  $(format_cost "$(estimate_total_cost "$total_tests" haiku)")"
    echo "  Sonnet 4:   $(format_cost "$(estimate_total_cost "$total_tests" sonnet)") (default)"
    echo "  Opus 4.5:   $(format_cost "$(estimate_total_cost "$total_tests" opus)")"
    echo ""
    echo "Estimated time: $(format_time "$(estimate_test_time "$total_tests")")"
    echo ""
    echo "Run without --dry-run to execute tests"
    exit 0
fi

for suite in $SUITES_TO_RUN; do
    runner=$(get_suite_runner "$suite")

    if [ -z "$runner" ] || [ ! -f "$runner" ]; then
        log_warn "SKIP: Test runner not found for $suite"
        continue
    fi

    echo ""
    echo "========================================"
    echo " Running: $suite"
    echo "========================================"
    echo ""

    VERBOSE_FLAG=""
    [ "$VERBOSE" = true ] && VERBOSE_FLAG="--verbose"

    # Build employee argument
    EMPLOYEE_FLAG=""
    if [ -n "$SPECIFIC_EMPLOYEE" ]; then
        EMPLOYEE_FLAG="--employee $SPECIFIC_EMPLOYEE"
    elif [ "$RUN_ALL" = true ]; then
        EMPLOYEE_FLAG="--all"
    fi

    if chmod +x "$runner" && bash "$runner" $VERBOSE_FLAG $EMPLOYEE_FLAG; then
        log_success "Suite $suite: PASSED"
        RESULTS="$RESULTS
  ✅ $suite"
    else
        log_error "Suite $suite: FAILED"
        RESULTS="$RESULTS
  ❌ $suite"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
done

# Print summary
echo ""
echo "========================================"
echo " Overall Results"
echo "========================================"
echo "$RESULTS"
echo ""

if [ $TOTAL_FAILED -gt 0 ]; then
    log_error "OVERALL STATUS: FAILED"
    exit 1
else
    log_success "OVERALL STATUS: PASSED"
    exit 0
fi
