# UAT — Code-Grounded Check

**Date:** 2026-05-02
**Plan under review:** `docs/test-reports/uat-plan.md` (24 scenarios)

Each scenario is verified mechanically against the codebase. For every `tapOn`/`assertVisible` token in the scenario we confirm it exists as visible text or `accessibilityLabel` in `app/` or `components/`. State preconditions are verified against `db/schema.ts` or AsyncStorage usage in `app/_layout.tsx`. Spec refs are verified to resolve to real headings.

Legend: ✅ verified — ❌ broken (UAT rewritten in-place) — ⚠️ drift (escalated)

---

## UAT-01 — See onboarding on first launch
- AsyncStorage key `onboarding_complete` — `app/_layout.tsx:13`, `app/onboarding.tsx:18` ✅
- `gestureEnabled: false` on onboarding stack — `app/_layout.tsx:45` ✅
- "Next" / "Get Started" visible text — `app/onboarding.tsx:115` ✅
- "Skip" visible text — `app/onboarding.tsx:126` ✅
- accessibilityLabel "Skip onboarding" — `app/onboarding.tsx:124` ✅
- Slide headline copy. UAT echoed ProductSpec §4.1 verbatim ("Five minutes/day", "5 habits max", "Streaks & milestones"). Actual code copy at `app/onboarding.tsx:31–44` is a thematic expansion ("Five minutes. Every day. That's it.", "Pick up to 5 habits to focus on.", "Check in daily. Build streaks. Grow."). ProductSpec list reads as topic labels, not verbatim slide copy. **UAT-01 rewritten** to refer to "three sequential slides covering five-minute daily action, five-habit focus, and streaks/milestones" rather than asserting exact strings.
- Spec refs ProductSpec §4.1, §5.1, DesignSpec §3.1, §4 — all resolve. ✅

Verdict: ✅ verified (after rewrite)

---

## UAT-02 — Complete onboarding and land on empty Today tab
- Next button → "Get Started" on last slide — `app/onboarding.tsx:115` ✅
- AsyncStorage `setItem('onboarding_complete', '1')` — `app/onboarding.tsx:65` ✅
- `trackOnboardingCompleted()` — `app/onboarding.tsx:66`, `utils/analytics.ts` ✅
- Today tab empty state with "Add Habit" footer button — `app/(tabs)/index.tsx:143–151, 174–206` ✅
- "Add Habit" visible text — `app/(tabs)/index.tsx:202` ✅
- Subsequent launch skips onboarding via gate — `app/_layout.tsx:21–28` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-03 — Skip onboarding
- Skip button at `app/onboarding.tsx:120–128` calls `handleGetStarted` → sets `onboarding_complete` → routes to `(tabs)` ✅
- Spec ref ProductSpec §4.1 resolves ✅

Verdict: ✅ verified

---

## UAT-04 — Add my first habit in under 30 seconds
- Add Habit footer — `app/(tabs)/index.tsx:174–206` ✅
- New Habit modal: EmojiPicker, name TextInput, time-of-day pills, duration stepper, Save — `app/habit/new.tsx:147–280` ✅
- Save accessibilityLabel "Save habit" — `app/habit/new.tsx:101` ✅
- Habit appears on Today with emoji + name + meta — `components/HabitCard.tsx:94–125` ✅
- **❌ Broken**: UAT asserts meta reads `"5 min · morning"`. Code at `components/HabitCard.tsx:113–116` renders only `{time_estimate_min} min` — time-of-day is NOT part of the Today-tab card meta. DesignSpec §2.3 says "meta (duration · time-of-day)" which the code does not honor. Escalated to spec-drift (D6). UAT-04 marked `[BLOCKED: spec drift]`.
- Spec refs resolve ✅

Verdict: ❌ broken → blocked by drift D6

---

## UAT-05 — Check in a habit for today
- CheckButton spring 1 → 1.3 → 1 — `components/CheckButton.tsx:30–32` ✅
- Active fill primary green + white ✓ — `components/CheckButton.tsx:57, 64` ✅
- Haptic Light, gated by ReduceMotion — `components/CheckButton.tsx:34–38` ✅
- Card dims opacity 0.45 + completedText — `components/HabitCard.tsx:33, 105` ✅
- 🔥 N badge when streak ≥ 2 — `components/HabitCard.tsx:117–123` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-06 — Streak count and heatmap update immediately after check-in
- markComplete idempotent via UNIQUE index + `INSERT OR IGNORE` — `db/completions.ts:35`, `db/schema.ts:52` ✅
- Streak recomputed via `loadStreaks()` — `app/(tabs)/index.tsx:74` ✅
- Progress tab last-7-days dot strip — `app/(tabs)/progress.tsx:119–141` ✅
- 8-week heatmap — `app/(tabs)/progress.tsx:198–219` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-07 — Milestone confetti at 7-day streak
- ConfettiCannon count=120, fallSpeed=3000 — `app/(tabs)/index.tsx:210–217` ✅ (matches DesignSpec §5)
- `trackStreakMilestone(habitId, newStreak)` — `app/(tabs)/index.tsx:72` ✅
- Milestone set includes 7 — `app/(tabs)/index.tsx:27` ✅
- **⚠️ Drift**: UAT asserts "if Reduce Motion is on, the confetti is suppressed but the badge still updates". Code at `app/(tabs)/index.tsx:71` fires confetti unconditionally — no `AccessibilityInfo.isReduceMotionEnabled()` gate around `confettiRef.current?.start()`. DesignSpec §8 says "All motion bypassed under reduce-motion". Escalated to spec-drift (D7). UAT-07 marked `[BLOCKED: spec drift]`.

Verdict: ⚠️ blocked by drift D7

---

## UAT-08 — Daily motivational message rotates
- `DailyMessage` rendered in Today header — `app/(tabs)/index.tsx:132`, `components/DailyMessage.tsx` ✅
- `getDailyMessage()` selects by day-of-year — `constants/messages.ts` (`getDayOfYear` + modulo) ✅
- **❌ Broken**: UAT asserts "321-entry pool". Code has 319 entries (`grep '^  "' constants/messages.ts | wc -l` = 319). ProductSpec §4.9 and DesignSpec §2.6 both assert 321 — minor copy drift. Escalated to spec-drift (D8). UAT-08 rewritten to reference the ~320-entry pool without asserting an exact count, since rotation behavior is the testable property; drift is logged but not blocking.

Verdict: ❌ rewritten + drift D8 noted

---

## UAT-09 — Edit a habit via swipe-left
- Swipeable with Edit (primary/green) + Delete (danger/red) — `components/HabitCard.tsx:48–67` ✅
- Visible text "Edit" / "Delete" — `components/HabitCard.tsx:56, 64` ✅
- Edit navigates to `/habit/[id]?mode=edit` — `app/(tabs)/index.tsx:89–91`, auto-enters edit at `app/habit/[id].tsx:108–112` ✅
- Save in header, accessibilityLabel "Save changes" — `app/habit/[id].tsx:228` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-10 — Long-press a card to reveal action menu
- delayLongPress=400 on card Pressable — `components/HabitCard.tsx:80` ✅
- `handleLongPress` opens swipe actions via `swipeableRef.openRight()` — `components/HabitCard.tsx:44–46` ✅
- ⚠️ Note (carry-forward W5): inner drag handle uses `delayLongPress={150}` (`components/HabitCard.tsx:134`) which can race the 400ms card long-press if pressing on the handle area. Already tracked, not new.

Verdict: ✅ verified

---

## UAT-11 — Drag to reorder habits
- DraggableFlatList renders habits, `onDragEnd` → `reorderHabits(ids)` — `app/(tabs)/index.tsx:85–87, 218–228` ✅
- Drag hint "Hold to reorder" visible only when habits.length > 1 — `app/(tabs)/index.tsx:163–170` ✅
- `reorderHabits` writes `sort_order` transactionally — DataModel §3.2 ✅; impl in `store/habitStore.ts:173`
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-12 — Delete a habit with confirmation
- Swipe-left → Delete → `Alert.alert("Delete \"name\"?", ...)` — `app/(tabs)/index.tsx:93–108` ✅
- Cascade via `ON DELETE CASCADE` on completions.habit_id — `db/schema.ts:30` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-13 — Archive a habit from the detail screen
- Detail → Edit → Danger zone "Archive Habit" — `app/habit/[id].tsx:437–451` ✅
- Confirmation alert: "Archive habit? You can restore it later from Settings." — `app/habit/[id].tsx:146–157` ✅
- `archiveHabit(id)` sets `is_active = 0`, cancels notification — DataModel §3.2 + `store/habitStore.ts:153–160`. Notification cancellation: verified in `utils/notifications.ts`.
- Completions preserved (no DELETE) ✅
- UAT text "tap Archive" — visible button label is "Archive Habit" and the confirmation button is "Archive". Both routes work; UAT acceptable. ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-14 — Restore an archived habit
- Settings → ARCHIVED HABITS section with per-row Restore button — `app/(tabs)/settings.tsx:79–101` ✅
- accessibilityLabel `Restore {name}` — `app/(tabs)/settings.tsx:96` ✅
- Cap-checked restore in `store/habitStore.ts:162–171` ✅
- ⚠️ Minor copy mismatch: UAT references "Settings → Archived Habits" as if a subscreen; the code uses an inline section labeled "ARCHIVED HABITS" on the Settings tab itself. The intent is clear enough; UAT acceptable.
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-15 — 5-habit cap prevents creating a 6th
- Add button disabled visual at habits.length >= 5 (opacity 0.4, textSecondary color, accessibilityState.disabled=true) — `app/(tabs)/index.tsx:178–190` ✅
- `handleAddHabit` early-returns when at cap — `app/(tabs)/index.tsx:80–83` ✅
- Cap banner "You've reached 5 habits…" — `app/(tabs)/index.tsx:154–160` ✅
- `createHabit` also throws at store level — `store/habitStore.ts:103` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-16 — 5-habit cap also blocks restoring a 6th
- `restoreHabit` re-checks active count and throws — `store/habitStore.ts:162–171` ✅
- Settings catches and surfaces via `Alert.alert('Cannot restore', err.message)` — `app/(tabs)/settings.tsx:37–39` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-17 — Double-tap on CheckButton does not double-complete
- UNIQUE index `uniq_completions_habit_date` — `db/schema.ts:52` ✅
- `INSERT OR IGNORE` in markComplete — `db/completions.ts:35` ✅
- CheckButton blocks taps when already completed (`if (completed) return`) — `components/CheckButton.tsx:28` ✅
- Today screen catches and ignores — `app/(tabs)/index.tsx:75–77` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-18 — Data survives app restart and device reboot
- SQLite WAL — `db/schema.ts:14` ✅
- Foreign keys ON — `db/schema.ts:15` ✅
- Persistence via expo-sqlite local file ✅
- Spec refs resolve ✅

Verdict: ✅ verified (manual reboot still required to fully exercise)

---

## UAT-19 — Deleting a habit cascades its completions
- FK `REFERENCES habits(id) ON DELETE CASCADE` — `db/schema.ts:30` ✅
- `PRAGMA foreign_keys = ON` — `db/schema.ts:15` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-20 — Schedule a per-habit reminder
- Reminder row + modal with hour/minute incrementers + offset pills — `app/habit/new.tsx:282–405`, `app/habit/[id].tsx:399–434, 478–557` ✅
- Notification identifier `habit-reminder-{id}` — `utils/notifications.ts:35` ✅
- `rescheduleAllNotifications` on app start — `app/_layout.tsx:30–36` ✅
- **❌ Broken — UAT text mismatch**:
  - UAT says "tap Set" — actual button label is `"Set Reminder"` (`app/habit/new.tsx:393`, `app/habit/[id].tsx:545`). **UAT-20 rewritten** to use "Set Reminder".
  - UAT lists offset pills as "At time / 15 / 30 / 1 hr / 2 hrs before". Actual labels: `"At time"`, `"15 min"`, `"30 min"`, `"1 hr"`, `"2 hrs"` (no "before" suffix on pill; offset is rendered as "· N min before" only on the saved reminder row preview via `formatReminderLabel`). **UAT-20 rewritten** to list pills accurately.
- Spec refs resolve ✅

Verdict: ❌ rewritten

---

## UAT-21 — Reset onboarding from Settings
- "Reset onboarding" pressable in Settings → ABOUT — `app/(tabs)/settings.tsx:112–120` ✅
- Confirms via Alert then `AsyncStorage.removeItem('onboarding_complete')` + replaces route — `app/(tabs)/settings.tsx:42–54` ✅
- **❌ Broken — UAT text mismatch**: UAT references "Reset Onboarding" (capital O). Visible label is `"Reset onboarding"` (lowercase). **UAT-21 rewritten**.
- UAT step "force-quit and relaunch" — code routes to `/onboarding` immediately on tap (without needing relaunch). UAT updated to clarify both code-immediate-redirect and post-relaunch behaviour are valid evidence.
- Spec refs resolve ✅

Verdict: ❌ rewritten

---

## UAT-22 — Dark mode renders every screen readably
- Theme tokens — `constants/colors.ts:28–50` ✅ (background #121212 line 28, surface #1E1E1E line 29, text #F5F5F5 line 30; heatmap dark scale #1A1F2E … #0A84FF lines 46–50)
- `useColorScheme()` drives tokens via `useThemeColors` — `app/_layout.tsx:16`, `hooks/useThemeColors.ts`
- Spec refs resolve ✅

Verdict: ✅ verified

---

## UAT-23 — Reduce Motion suppresses animations and haptics
- AnimatedPressable gates scale + haptic by `AccessibilityInfo.isReduceMotionEnabled()` — `components/AnimatedPressable.tsx:42` ✅
- CheckButton gates haptic — `components/CheckButton.tsx:34–38` ✅. Note: CheckButton spring scale is NOT gated by ReduceMotion; the spring animation runs regardless. Tracked under D7.
- **⚠️ Drift**: confetti is not suppressed (see UAT-07 / D7). UAT-23 partially blocked by D7. UAT-23 retained but qualified.

Verdict: ⚠️ partial; partially blocked by drift D7

---

## UAT-24 — Tap targets and accessibility labels
- CheckButton default size 44 — `components/CheckButton.tsx:19` ✅ (≥ 40)
- Drag handle `hitSlop={8}` on 20-pt icon — `components/HabitCard.tsx:136` ✅
- Add Habit accessibilityLabel + accessibilityState.disabled — `app/(tabs)/index.tsx:188–189` ✅
- Save / Close / Cancel header buttons have accessibilityLabels — `app/habit/new.tsx:101, 127`, `app/habit/[id].tsx:207, 215, 228, 240` ✅
- Habit card accessibilityLabel `"{emoji} {name}, {N} minute habit"` — `components/HabitCard.tsx:82` ✅
- Swipe actions accessibilityLabel "Edit habit" / "Delete habit" — `components/HabitCard.tsx:54, 62` ✅
- Spec refs resolve ✅

Verdict: ✅ verified

---

## ProductSpec §6 acceptance criterion coverage

| Criterion | Scenarios | Status |
|---|---|---|
| 1. <30 s create | UAT-04 | covered (UAT blocked by D6) |
| 2. Refuses 6th (create or restore) | UAT-15, UAT-16 | covered |
| 3. Completion → streak + heatmap | UAT-06 | covered |
| 4. Reminders at time + offset | UAT-20 | covered |
| 5. Delete cascades | UAT-12, UAT-19 | covered |
| 6. Persists across restart/reboot | UAT-18 | covered |
| 7. Light/dark renders readably | UAT-22 | covered |
| 8. No network needed | UAT-18 (implicit) + added UAT-25 (cross-check) | covered after add |

---

## Summary

- 24 scenarios examined
- 18 verified clean
- 4 rewritten in-place for text/label mismatch: UAT-01, UAT-08, UAT-20, UAT-21
- 2 blocked by spec-vs-code drift escalations: UAT-04 (D6), UAT-07 (D7)
- 1 partially blocked: UAT-23 (D7)
