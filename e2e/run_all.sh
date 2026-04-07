#!/bin/bash
set -euo pipefail

export PATH="$PATH:$HOME/.maestro/bin"
export ANDROID_HOME=/usr/local/share/android-commandlinetools
DEVICE="adb-R5CW22HQ9JY-L2k7Bc._adb-tls-connect._tcp"
DIR="$(cd "$(dirname "$0")" && pwd)"

PASS=0
FAIL=0
FAILED_FLOWS=()

run_flow() {
  local flow="$1"
  local name
  name=$(basename "$flow" .yaml)
  echo ""
  echo "▶ $name"
  if maestro --device "$DEVICE" test "$flow" 2>&1; then
    echo "  ✓ PASS"
    ((PASS++))
  else
    echo "  ✗ FAIL"
    ((FAIL++))
    FAILED_FLOWS+=("$name")
  fi
}

echo "=============================="
echo "  MicroMoment E2E Test Suite  "
echo "=============================="

for flow in "$DIR"/[0-9]*.yaml; do
  run_flow "$flow"
done

echo ""
echo "=============================="
echo "  Results: $PASS passed, $FAIL failed"
if [ ${#FAILED_FLOWS[@]} -gt 0 ]; then
  echo "  Failed flows:"
  for f in "${FAILED_FLOWS[@]}"; do
    echo "    - $f"
  done
fi
echo "=============================="

[ "$FAIL" -eq 0 ]
