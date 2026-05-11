#!/bin/bash
# Per-flow Maestro runner for Flint. Outputs one line per flow:
#   PASS <name> | FAIL <name> | TIMEOUT <name>
# Logs land in /tmp/flint-<name>.log; screenshots on failure.
set -uo pipefail

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export PATH="$JAVA_HOME/bin:$HOME/.maestro/bin:$PATH"

DIR="$(cd "$(dirname "$0")" && pwd)"

# Portable timeout: prefer gtimeout (coreutils), fall back to perl alarm shim.
if command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT_CMD=(gtimeout 120)
elif command -v timeout >/dev/null 2>&1; then
  TIMEOUT_CMD=(timeout 120)
else
  TIMEOUT_CMD=(perl -e 'alarm 120; exec @ARGV or die "exec: $!"' --)
fi

PASS=0
FAIL=0

for flow in "$DIR"/[0-9]*.yaml; do
  name=$(basename "$flow" .yaml)
  if "${TIMEOUT_CMD[@]}" maestro test "$flow" > "/tmp/flint-$name.log" 2>&1; then
    echo "PASS $name"
    PASS=$((PASS + 1))
  else
    rc=$?
    if [ "$rc" -eq 124 ] || [ "$rc" -eq 142 ]; then
      echo "TIMEOUT $name"
    else
      echo "FAIL $name"
    fi
    xcrun simctl io booted screenshot "/tmp/flint-$name-fail.png" 2>/dev/null || true
    FAIL=$((FAIL + 1))
  fi
done

echo "==== TOTALS: $PASS pass / $FAIL fail ===="
