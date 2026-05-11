# Spec-vs-Code Drift — Found During UAT Plan Validation

**Date:** 2026-05-02
**Resolved:** 2026-05-10
**Tester:** Flint (iOS QA)

All three drifts uncovered during UAT validation are now resolved in code.

---

## D6 — HabitCard meta missing time-of-day — RESOLVED

- **Spec:** DesignSpec §2.3 — meta is "duration · time-of-day"
- **Was:** `components/HabitCard.tsx` rendered only `{N} min`
- **Fix:** Added inline `TIME_OF_DAY_META` map; card now renders `"{N} min · 🌅 Morning"` etc.
- **Unblocks:** UAT-04

## D7 — Reduce Motion not gated for confetti or CheckButton spring — RESOLVED

- **Spec:** DesignSpec §6 and §8 — "All motion bypassed under reduce-motion"
- **Was:** Confetti and CheckButton spring fired unconditionally
- **Fix:** Added `hooks/useReduceMotion.ts` (subscribes to `AccessibilityInfo.reduceMotionChanged`). Confetti `start()` in `app/(tabs)/index.tsx` and CheckButton spring + haptic in `components/CheckButton.tsx` both gated on `!reduceMotion`.
- **Unblocks:** UAT-07, UAT-23

## D8 — DAILY_MESSAGES off by 2 — RESOLVED

- **Spec:** ProductSpec §4.9 / DesignSpec §2.6 — "321-message pool"
- **Was:** `constants/messages.ts` had 319 entries
- **Fix:** Added 2 more messages to reach 321.
- **Unblocks:** cosmetic only (UAT-08 was already passing modulo rotation)
