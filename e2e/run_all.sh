#!/bin/bash
set -euo pipefail

export PATH="$PATH:$HOME/.maestro/bin"
export ANDROID_HOME=/usr/local/share/android-commandlinetools

# Maestro requires a JRE. Auto-locate Java if JAVA_HOME isn't already set.
if [ -z "${JAVA_HOME:-}" ]; then
  for candidate in /opt/homebrew/opt/openjdk@17 /opt/homebrew/opt/openjdk /usr/local/opt/openjdk@17 /usr/local/opt/openjdk; do
    if [ -d "$candidate" ]; then
      export JAVA_HOME="$candidate"
      export PATH="$JAVA_HOME/bin:$PATH"
      break
    fi
  done
fi

DIR="$(cd "$(dirname "$0")" && pwd)"

# Pick a device. Override with: DEVICE=<id> bash run_all.sh
# Auto-detection priority: explicit env -> booted iOS sim -> first connected adb device.
if [ -z "${DEVICE:-}" ]; then
  IOS_DEVICE=$(xcrun simctl list devices booted 2>/dev/null | awk -F'[()]' '/Booted/ {print $2; exit}')
  if [ -n "$IOS_DEVICE" ]; then
    DEVICE="$IOS_DEVICE"
  else
    ADB_DEVICE=$(adb devices 2>/dev/null | awk 'NR>1 && $2=="device" {print $1; exit}')
    if [ -n "$ADB_DEVICE" ]; then
      DEVICE="$ADB_DEVICE"
    fi
  fi
fi

if [ -z "${DEVICE:-}" ]; then
  echo "✗ No device found. Boot an iOS simulator (xcrun simctl boot 'iPhone 15') or connect an Android device, or set DEVICE=<id>." >&2
  exit 1
fi
echo "Using device: $DEVICE"

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
