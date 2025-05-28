#!/bin/bash

# ScriptIt CLI Entry Point
# Intelligent runtime detection and delegation with manual selection support
# Priority: Manual selection > Bun > Deno > Node.js (with tsx for TypeScript support)
#
# Runtime Selection Options:
#   Environment: SCRIPTIT_RUNTIME=bun|deno|node
#   Flag: --runtime=bun|deno|node (takes precedence over environment)

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_FILE="$SCRIPT_DIR/../dist/cli.js"

# Initialize runtime selection
SELECTED_RUNTIME=""
REMAINING_ARGS=()

# Parse arguments to extract --runtime flag
while [[ $# -gt 0 ]]; do
    case $1 in
        --runtime=*)
            SELECTED_RUNTIME="${1#*=}"
            shift
            ;;
        --runtime)
            SELECTED_RUNTIME="$2"
            shift 2
            ;;
        --help-runtime)
            echo "ScriptIt Runtime Selection:"
            echo ""
            echo "Environment Variable:"
            echo "  SCRIPTIT_RUNTIME=bun|deno|node"
            echo ""
            echo "Command Line Flag:"
            echo "  --runtime=bun|deno|node"
            echo "  --runtime bun|deno|node"
            echo ""
            echo "Examples:"
            echo "  SCRIPTIT_RUNTIME=node scriptit exec script.js"
            echo "  scriptit --runtime=bun exec script.ts"
            echo "  scriptit --runtime deno run"
            echo ""
            echo "Available runtimes:"
            echo "  bun    - Bun runtime (recommended for TypeScript)"
            echo "  deno   - Deno runtime"
            echo "  node   - Node.js runtime (uses tsx for TypeScript if available)"
            echo ""
            exit 0
            ;;
        *)
            REMAINING_ARGS+=("$1")
            shift
            ;;
    esac
done

# Set remaining args back to positional parameters
set -- "${REMAINING_ARGS[@]}"

# Check environment variable if no runtime flag was provided
if [ -z "$SELECTED_RUNTIME" ] && [ -n "$SCRIPTIT_RUNTIME" ]; then
    SELECTED_RUNTIME="$SCRIPTIT_RUNTIME"
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate runtime selection
validate_runtime() {
    local runtime="$1"
    case "$runtime" in
        bun)
            if ! command_exists bun; then
                echo "❌ ScriptIt Error: Bun runtime selected but not found"
                echo "💡 Install Bun: https://bun.sh"
                exit 1
            fi
            ;;
        deno)
            if ! command_exists deno; then
                echo "❌ ScriptIt Error: Deno runtime selected but not found"
                echo "💡 Install Deno: https://deno.land"
                exit 1
            fi
            ;;
        node)
            if ! command_exists node; then
                echo "❌ ScriptIt Error: Node.js runtime selected but not found"
                echo "💡 Install Node.js: https://nodejs.org"
                exit 1
            fi
            ;;
        "")
            # No selection, will use auto-detection
            ;;
        *)
            echo "❌ ScriptIt Error: Invalid runtime '$runtime'"
            echo "💡 Valid options: bun, deno, node"
            echo "💡 Use --help-runtime for more information"
            exit 1
            ;;
    esac
}

# Function to run with Bun
run_with_bun() {
    if command_exists bun; then
        exec bun "$CLI_FILE" "$@"
    else
        return 1
    fi
}

# Function to run with Deno
run_with_deno() {
    if command_exists deno; then
        exec deno run --allow-all "$CLI_FILE" "$@"
    else
        return 1
    fi
}

# Function to run with Node.js (with tsx for TypeScript support)
run_with_node() {
    if command_exists node; then
        # Check if tsx is available for better TypeScript support
        if command_exists npx && npx tsx --version >/dev/null 2>&1; then
            exec npx tsx "$CLI_FILE" "$@"
        else
            exec node "$CLI_FILE" "$@"
        fi
    else
        return 1
    fi
}

# Function to show runtime detection info (only in debug mode)
show_runtime_info() {
    if [ "$SCRIPTIT_DEBUG" = "true" ]; then
        echo "🔍 ScriptIt Runtime Detection:"
        if [ -n "$SELECTED_RUNTIME" ]; then
            echo "  Selected Runtime: $SELECTED_RUNTIME"
        else
            echo "  Auto-detection mode (Priority: Bun > Deno > Node.js)"
        fi
        echo "  Bun: $(command_exists bun && echo "✅ Available" || echo "❌ Not found")"
        echo "  Deno: $(command_exists deno && echo "✅ Available" || echo "❌ Not found")"
        echo "  Node.js: $(command_exists node && echo "✅ Available" || echo "❌ Not found")"
        echo "  tsx: $(command_exists npx && npx tsx --version >/dev/null 2>&1 && echo "✅ Available" || echo "❌ Not found")"
        echo ""
    fi
}

# Check if CLI file exists
if [ ! -f "$CLI_FILE" ]; then
    echo "❌ ScriptIt Error: CLI file not found at $CLI_FILE"
    echo "💡 Try running 'npm run build' or 'bun run build' first"
    exit 1
fi

# Validate selected runtime
validate_runtime "$SELECTED_RUNTIME"

# Show runtime detection info if in debug mode
show_runtime_info

# Execute with selected or auto-detected runtime
if [ -n "$SELECTED_RUNTIME" ]; then
    # Manual runtime selection
    case "$SELECTED_RUNTIME" in
        bun)
            run_with_bun "$@"
            ;;
        deno)
            run_with_deno "$@"
            ;;
        node)
            run_with_node "$@"
            ;;
    esac
else
    # Auto-detection (original behavior)
    if run_with_bun "$@"; then
        exit 0
    elif run_with_deno "$@"; then
        exit 0
    elif run_with_node "$@"; then
        exit 0
    else
        echo "❌ ScriptIt Error: No compatible JavaScript runtime found"
        echo ""
        echo "Please install one of the following:"
        echo "  • Bun (recommended): https://bun.sh"
        echo "  • Deno: https://deno.land"
        echo "  • Node.js: https://nodejs.org"
        echo ""
        echo "For the best TypeScript experience, we recommend Bun."
        echo "💡 Use --help-runtime for runtime selection options"
        exit 1
    fi
fi 