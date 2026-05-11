# iOS Test Report — post-spec-baseline (run #4)

Date: 2026-05-02
Project: MicroMoment
Branch: fix/e2e-runner-and-tap-targets
Tester: Flint (iOS QA)
Specs: docs/ProductSpec.md, docs/DesignSpec.md, docs/DataModel.md

## Summary

- Total tests / checks: 33 regression items (R01–R33) + 22 UAT flows (uat-id 00–21) + 6 static suites
- ✅ Pass (static): 38
- ❌ Fail: 4
- ⚠️ Risk: 6
- 🔲 Blocked (E2E): 22 (entire Maestro suite — Maestro CLI not installed on host; see #58)

## Phase Go/No-Go: NO-GO

Reason: Maestro binary is absent on the test host so the full E2E regression cannot be validated for run #4; in addition, two design-spec drifts (CheckButton size, missing header FAB) and one data-correctness risk (TOCTOU on markComplete) must be addressed before this phase is signed off.

## Spec ↔ Code drift summary

| # | Drift | Spec ref | Code |
|---|---|---|---|
| D1 | CheckButton renders 36×36, spec says 40×40 and a11y guidance ≥40×40 | DesignSpec § 2.4, § 6 | components/CheckButton.tsx:19, components/HabitCard.tsx:128 |
| D2 | "FAB-style '+' in header right" not present; instead inline footer "Add Habit" button | DesignSpec § 3.2 | app/(tabs)/index.tsx:174-206 |
| D3 | DesignSpec lists "EmojiPicker" as a reusable component § 2.7 but emoji grid is duplicated inline in new.tsx and [id].tsx | DesignSpec § 2.7 | app/habit/new.tsx:38-43, app/habit/[id].tsx:23-28 |
| D4 | Color tokens \`amber\`, \`heatmap0..4\` exist in code but absent from DesignSpec § 1.1 token table (heatmap range is described prose-only "blue gradient") | DesignSpec § 1.1 | constants/colors.ts |
| D5 | DesignSpec § 4 navigation says habit/new is "modal" with no swipe-down for onboarding only — habit/new currently uses presentation: 'modal' (correct), but Stack.Screen header config is overridden inline within new.tsx body, fighting the parent stack (cosmetic) | DesignSpec § 4 | app/_layout.tsx:47, app/habit/new.tsx:121-141 |
| D6 | ProductSpec § 4.1 says onboarding is "Skippable. Completion writes onboarding_complete to AsyncStorage and emits an onboarding_completed analytics event" — analytics event is fired, but only after Skip button which calls handleGetStarted. ✓ Verified. No drift. | — | — |

## Failed tests (❌)

| ID | Test | Expected | Found | File:line | Issue |
|---|---|---|---|---|---|
| F1 | CheckButton tap target ≥ 40×40 (DesignSpec § 6) | 40×40 minimum, 44×44 per Apple HIG | 36×36 (size default 36, used unchanged) | components/CheckButton.tsx:19, components/HabitCard.tsx:128 | #56 |
| F2 | Today screen header FAB "+" (DesignSpec § 3.2) | "+" icon top-right of header, disabled at cap | No header rendered; inline footer "Add Habit" button instead | app/(tabs)/index.tsx:174-206 | #57 |
| F3 | E2E suite executable (R01–R28, UAT 00–21) | maestro CLI present on host PATH | "maestro: command not found" for all 22 flows | /tmp/maestro-run.log; e2e/run_all.sh:38 | #58 |
| F4 | One-completion-per-day invariant DB-enforced (DataModel § 2.4) | UNIQUE constraint or atomic INSERT … ON CONFLICT | TOCTOU between hasCompletionToday and insertCompletion; no DB UNIQUE | store/habitStore.ts:187, db/schema.ts:28 | #59 |

## Risks (⚠️)

| ID | Description | Likelihood | Mitigation |
|---|---|---|---|
| W1 | Onboarding gate flashes (tabs) before redirect on cold launch — useEffect runs after rootState.key resolves, so initial frame shows Today before navigating to /onboarding | Medium | Render null while AsyncStorage check pending; or block Stack mount until flag known |
| W2 | rescheduleAllNotifications cancels ALL scheduled notifications globally on every app start, then re-schedules. If a notification fires while the app is launching it could be cancelled mid-flight | Low | Migrate to per-id cancel-and-replace, or only reschedule when habits[] changed |
| W3 | hasCompletionToday + insertCompletion race (W4-related: see F4 / #59) | Low | DB UNIQUE index (#59) |
| W4 | Reminder time scheduled in 24h DAILY trigger uses ChannelId on iOS path too — \`channelId\` is Android-only, harmless on iOS but suggests cross-platform handling not split. | Low | Pass channelId only when EXPO_OS === 'android' |
| W5 | DraggableFlatList shares Pressable + onLongPress (drag) + onLongPress (open swipe menu) on the same card. delayLongPress=400 on parent vs delayLongPress=150 on drag handle — drag handle wins by being a separate hitbox, but on small phones / large fingers the gestures can interfere | Medium | Add hitSlop to drag handle, make delays distinct, validate with E2E once #58 unblocks |
| W6 | DataModel mentions \`grace_used\` column on completions but no UI surfaces or sets it; vestigial column adds confusion | Low | Either implement grace-day feature or remove column / spec entry |

## Blocked (🔲)

All 22 Maestro flows (00–21) cannot execute — see #58. Authored 11 new flows (11_add_habit_full, 12_double_complete, 13_persistence, 14_streak_badge, 15_milestone_confetti, 16_reorder, 17_longpress_menu, 18_restore_cap_block, 19_tabs, 20_reset_onboarding, 21_drag_hint) — they are static (parsed-only) until #58 is fixed.

## Static suites

### Suite 1 — iOS Platform Behavior
- Location: N/A (no location features) — PASS
- Audio: N/A (no audio features) — PASS
- Security: All persistence is local SQLite + AsyncStorage flag; no secrets in repo (Sentry/PostHog keys read from process.env); HTTPS not used because local-first — PASS
- Layout / SafeArea: every screen wraps in \`SafeAreaView\`. ✅
- StatusBar: \`StatusBar style\` toggled by colorScheme in app/_layout.tsx:42 — PASS
- Keyboard avoidance: KeyboardAvoidingView used in new.tsx and [id].tsx with headerHeight offset — PASS
- Swipe-back: Onboarding gestureEnabled: false intentionally; rest enabled — PASS
- StoreKit / IAP: not applicable — PASS

### Suite 2 — Navigation Flows
PS § 5.1–5.6 mapped to flows 00, 01, 02, 03, 07, 10. All currently BLOCKED on E2E (#58). Static read of code paths confirms each flow is reachable. PASS (static).

### Suite 3 — UX Compliance
- Colors: light tokens match DesignSpec § 1.1 ✓ except undocumented \`amber\` and \`heatmap*\` (D4) — RISK
- Typography: title (28/700/-0.5), section labels (11/700/letterSpacing 1) match. Body sizes match. ✓
- Spacing: screen padding 20 ✓; card padding 14 ✓; section gaps 24/28 ✓
- Components: HabitCard, CheckButton, Button, AnimatedPressable, CompletionRing, DailyMessage all present — except EmojiPicker is inlined (D3, minor)
- Header FAB drift (D2 / F2)

### Suite 4 — Feature Completeness
All ProductSpec § 4 features wired: 4.1 Onboarding ✓, 4.2 CRUD ✓, 4.3 Check-in ✓, 4.4 Streaks/milestones ✓, 4.5 Drag ✓, 4.6 Swipe/long-press ✓, 4.7 Progress ✓, 4.8 Reminders ✓, 4.9 Daily message ✓, 4.10 Dark mode ✓, 4.11 Settings ✓.

### Suite 5 — Edge cases
- Offline: PASS — no network code outside analytics best-effort
- Empty list state on Today / Progress / Settings — all present ✓
- Long names: TextInput maxLength 50 ✓
- 5-habit cap enforced in store and UI ✓
- Force-quit recovery: SQLite + AsyncStorage flag, no in-memory state to lose — PASS

### Suite 6 — Accessibility
- Labels: every Pressable has accessibilityRole + accessibilityLabel ✓
- Tap target ≥ 44×44: FAIL (CheckButton 36×36, F1 / #56)
- Reduce-motion respected in CheckButton + AnimatedPressable ✓
- Colors: text/textSecondary contrast on light/dark backgrounds appears WCAG AA but not formally audited — RISK low
- VoiceOver order: not manually verified — BLOCKED until E2E + manual run

## Recommendations (ordered)

1. **Provision Maestro on the test host** (resolves #58). Without this, run #5 will be a duplicate report.
2. **Fix CheckButton tap target** to 44×44 (resolves #56) — single-line default change in components/CheckButton.tsx + optional hitSlop.
3. **Resolve header-FAB drift** (#57): either update the DesignSpec § 3.2 to ratify the inline footer button (cheapest), or implement the header "+".
4. **Add UNIQUE index on completions(habit_id, completed_date)** (#59) and switch insertCompletion to ON CONFLICT DO NOTHING.
5. **Fix onboarding flash (W1)** — gate Stack rendering on AsyncStorage hydration before first paint.
6. **Decide on \`grace_used\` column (W6)** — implement grace day or drop the column from schema.
7. After #58 lands, re-run run_all.sh, expect at minimum the 11 pre-existing flows to pass; then triage 11–21 for any environment-specific failures.
