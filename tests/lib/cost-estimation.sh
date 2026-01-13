#!/usr/bin/env bash
# Claude Code cost estimation tool
# Based on LiteLLM pricing data and ccusage/ccstatusline projects

# Claude model pricing (USD per token)
# Source: https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
# Updated: 2026-01

# Claude Sonnet 4 (default model)
SONNET_INPUT_COST="0.000003"      # $3/M tokens
SONNET_OUTPUT_COST="0.000015"     # $15/M tokens
SONNET_CACHE_READ_COST="0.0000003"  # $0.3/M tokens

# Claude Opus 4.5
OPUS_INPUT_COST="0.000005"        # $5/M tokens
OPUS_OUTPUT_COST="0.000025"       # $25/M tokens
OPUS_CACHE_READ_COST="0.0000005"  # $0.5/M tokens

# Claude Haiku 3.5
HAIKU_INPUT_COST="0.0000008"      # $0.8/M tokens
HAIKU_OUTPUT_COST="0.000004"      # $4/M tokens
HAIKU_CACHE_READ_COST="0.00000008" # $0.08/M tokens

# Typical test scenario token estimates
# Each test includes:
# - System prompt + skill definition: ~5000 tokens (input)
# - User prompt: ~200 tokens (input)
# - Claude response (including skill call): ~1500 tokens (output)
# - Cache read (subsequent turns): ~3000 tokens

TYPICAL_INPUT_TOKENS=5200
TYPICAL_OUTPUT_TOKENS=1500
TYPICAL_CACHED_TOKENS=3000

# Estimate single test cost (using Sonnet)
# Usage: estimate_test_cost [model]
estimate_test_cost() {
    local model="${1:-sonnet}"
    local input_cost output_cost cache_cost

    case "$model" in
        opus|opus4.5|opus-4.5)
            input_cost=$OPUS_INPUT_COST
            output_cost=$OPUS_OUTPUT_COST
            cache_cost=$OPUS_CACHE_READ_COST
            ;;
        haiku|haiku3.5|haiku-3.5)
            input_cost=$HAIKU_INPUT_COST
            output_cost=$HAIKU_OUTPUT_COST
            cache_cost=$HAIKU_CACHE_READ_COST
            ;;
        sonnet|sonnet4|sonnet-4|*)
            input_cost=$SONNET_INPUT_COST
            output_cost=$SONNET_OUTPUT_COST
            cache_cost=$SONNET_CACHE_READ_COST
            ;;
    esac

    # Calculate: (input * input_cost) + (output * output_cost) + (cached * cache_cost)
    echo "scale=4; ($TYPICAL_INPUT_TOKENS * $input_cost) + ($TYPICAL_OUTPUT_TOKENS * $output_cost) + ($TYPICAL_CACHED_TOKENS * $cache_cost)" | bc
}

# Estimate total cost for multiple tests
# Usage: estimate_total_cost <count> [model]
estimate_total_cost() {
    local count="$1"
    local model="${2:-sonnet}"
    local single_cost

    single_cost=$(estimate_test_cost "$model")
    echo "scale=2; $single_cost * $count" | bc
}

# Format cost display
# Usage: format_cost <cost>
format_cost() {
    local cost="$1"
    printf "\$%.2f" "$cost"
}

# Estimate test cost range (minimum to maximum)
# Usage: estimate_cost_range <count>
estimate_cost_range() {
    local count="$1"
    local min_cost max_cost

    # Haiku is cheapest, Opus is most expensive
    min_cost=$(estimate_total_cost "$count" "haiku")
    max_cost=$(estimate_total_cost "$count" "opus")

    echo "$(format_cost "$min_cost") - $(format_cost "$max_cost")"
}

# Print cost breakdown details
# Usage: print_cost_breakdown <count>
print_cost_breakdown() {
    local count="$1"

    echo "Cost Estimation for $count tests:"
    echo ""
    echo "  Per-test token usage (estimated):"
    echo "    Input tokens:  $TYPICAL_INPUT_TOKENS"
    echo "    Output tokens: $TYPICAL_OUTPUT_TOKENS"
    echo "    Cached tokens: $TYPICAL_CACHED_TOKENS"
    echo ""
    echo "  Model pricing (per test):"
    echo "    Haiku 3.5:  $(format_cost "$(estimate_test_cost haiku)")"
    echo "    Sonnet 4:   $(format_cost "$(estimate_test_cost sonnet)")"
    echo "    Opus 4.5:   $(format_cost "$(estimate_test_cost opus)")"
    echo ""
    echo "  Total cost estimates:"
    echo "    Haiku 3.5:  $(format_cost "$(estimate_total_cost "$count" haiku)")"
    echo "    Sonnet 4:   $(format_cost "$(estimate_total_cost "$count" sonnet)")"
    echo "    Opus 4.5:   $(format_cost "$(estimate_total_cost "$count" opus)")"
    echo ""
    echo "  Using default (Sonnet 4): $(format_cost "$(estimate_total_cost "$count" sonnet)")"
}

# Estimate test time
# Usage: estimate_test_time <count>
# Returns: estimated minutes
estimate_test_time() {
    local count="$1"
    # Each test takes approximately 2 minutes (including API calls, processing time, etc.)
    echo "$((count * 2))"
}

# Format time display
# Usage: format_time <minutes>
format_time() {
    local minutes="$1"
    if [ "$minutes" -ge 60 ]; then
        local hours=$((minutes / 60))
        local mins=$((minutes % 60))
        echo "${hours}h ${mins}m"
    else
        echo "${minutes}m"
    fi
}

# Export functions
export -f estimate_test_cost
export -f estimate_total_cost
export -f format_cost
export -f estimate_cost_range
export -f print_cost_breakdown
export -f estimate_test_time
export -f format_time
