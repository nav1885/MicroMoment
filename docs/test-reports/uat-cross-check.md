# UAT — Independent Cross-Check Against Spec

**Date:** 2026-05-02
**Plan under review:** `docs/test-reports/uat-plan.md`
**Sources re-read:** `docs/ProductSpec.md`, `docs/DesignSpec.md`, `docs/DataModel.md`

## Method

I re-read ProductSpec / DesignSpec / DataModel from scratch and enumerated every distinct testable behavior or invariant, without consulting the existing 24-scenario UAT plan. Once enumerated, I diffed the independent list against the plan and recorded gaps.

## Independent enumeration (bullet form)

### ProductSpec §4 — Feature list

- §4.1 Onboarding shows on first launch
- §4.1 Onboarding is skippable
- §4.1 Onboarding completion writes `onboarding_complete` to AsyncStorage
- §4.1 Onboarding completion emits `onboarding_completed` analytics event
- §4.1 Onboarding is resettable from Settings
- §4.2 Create habit (emoji, name 1–50 chars, time-of-day, duration 1–5 min, optional reminder)
- §4.2 Today tab list rendering, detail screen rendering
- §4.2 Archived list in Settings
- §4.2 Update habit
- §4.2 Hard delete with confirmation, cascade
- §4.2 Archive (soft) with confirmation
- §4.2 Restore (with 5-cap check)
- §4.2 Hard cap on create
- §4.2 Hard cap banner displayed
- §4.3 Single-tap completion
- §4.3 Spring scale + haptic + checkmark glyph
- §4.3 Double-completion silently prevented
- §4.4 🔥 N badge when streak ≥ 2
- §4.4 Milestone confetti at {7,14,21,30,60,90,180,365}
- §4.4 `streak_milestone` analytics event
- §4.5 Drag-to-reorder via long-press or ⋮⋮ handle
- §4.5 `sort_order` persistence
- §4.5 Drag hint shown when ≥ 2 habits
- §4.6 Swipe-left reveals Edit + Delete
- §4.6 Long-press 400ms opens same menu
- §4.7 Progress: last 7 days dot strip + count
- §4.7 Progress: per-habit stats (current / longest / total)
- §4.7 Progress: 8-week heatmap, Monday-anchored, week labels left
- §4.8 Optional daily reminder per habit
- §4.8 Configurable time + offset (0/15/30/60/120)
- §4.8 Notifications rescheduled on every app start
- §4.8 Android `habit-reminders` channel, HIGH importance
- §4.9 Rotating daily message indexed by day-of-year
- §4.10 Light/dark theme via `useColorScheme()`
- §4.11 Settings — archived list, restore action
- §4.11 Settings — About, version, reset onboarding

### ProductSpec §6 — Acceptance criteria

- ≤ 30 s to create a habit
- Refuses 6th active (create + restore)
- Completion reflects in streak + heatmap immediately
- Reminders fire at local time, accounting for offset, daily
- Delete cascades completions
- Survives restart + reboot
- Light + dark render readably
- No screen needs network

### DesignSpec — Component / UX rules

- AnimatedPressable: scale 0.96 + haptic, gated by ReduceMotion
- HabitCard meta = duration · time-of-day (DesignSpec §2.3)
- CheckButton 40×40 (effectively 44 per resolved D1), spring 1 → 1.3 → 1
- CompletionRing: animated foreground stroke, centered counter
- DailyMessage: 321-message pool (D8 — actual 319)
- EmojiPicker: 40 curated emoji
- ReminderModal: hour/minute incrementers + offset pills
- Onboarding: primary-green background, horizontal FlatList non-scrollable, dots, Next → "Get Started" on last, Skip top-right
- Today: header + DailyMessage + DraggableFlatList + drag hint + Add Habit footer + cap banner + confetti overlay
- Today empty state: friendly prompt + same Add Habit footer
- Progress: last-7 card, per-habit stats, 8-week heatmap
- Settings: archived list rows, About (version, reset onboarding)
- New Habit: modal with EmojiPicker, name, time-of-day pills, duration stepper, Reminder row; KeyboardAvoidingView; header Close + Save
- Habit Detail: hero view + Mark Complete button; Edit mode = New Habit form + danger zone; not-found fallback when habit deleted while open
- Reduce-motion bypasses ALL motion (DesignSpec §8) — D7
- Tap targets ≥ 40×40

### DataModel — Invariants

- 5-habit cap enforced in store layer (D=DataModel §2.4, §3.2)
- One completion per (habit_id, completed_date) enforced via UNIQUE index + INSERT OR IGNORE
- FK cascade on delete
- Archiving preserves completions
- SQLite WAL, FK on, AsyncStorage only for onboarding flag

## Diff against existing UAT plan (UAT-01 … UAT-24)

| Behavior | Coverage in original 24 | Action |
|---|---|---|
| Onboarding first launch | UAT-01 | covered |
| Onboarding completion | UAT-02 | covered |
| Onboarding skip | UAT-03 | covered |
| Onboarding reset from Settings | UAT-21 | covered |
| Create habit happy path | UAT-04 | covered |
| Habit name validation 1–50 | — | **GAP → UAT-29** |
| Daily check-in (CheckButton on Today) | UAT-05 | covered |
| Detail-screen "Mark Complete" path | — | **GAP → UAT-28** |
| Double-completion prevented | UAT-17 | covered |
| Streak update post-check-in | UAT-06 | covered |
| Heatmap renders | UAT-06 | covered |
| Per-habit stats (current / longest / total) on Progress | — | **GAP → UAT-26** |
| Milestone confetti | UAT-07 | covered (blocked by D7) |
| Daily message rotation | UAT-08 | covered |
| Swipe-left edit/delete | UAT-09, UAT-12 | covered |
| Long-press menu 400ms | UAT-10 | covered |
| Drag-to-reorder + hint + persistence | UAT-11 | covered |
| Delete confirmation + cascade | UAT-12, UAT-19 | covered |
| Archive + history preserved | UAT-13 | covered |
| Restore from Settings | UAT-14 | covered |
| 5-cap on create | UAT-15 | covered |
| 5-cap on restore | UAT-16 | covered |
| Restart/reboot persistence | UAT-18 | covered |
| Reminder schedule | UAT-20 | covered |
| Notifications rescheduled on app start (dedicated) | mentioned inline in UAT-20 | **GAP → UAT-27** |
| Dark mode | UAT-22 | covered |
| Reduce-motion respected | UAT-23 | covered (partial; D7) |
| Tap targets + a11y labels | UAT-24 | covered |
| Detail-screen "not found" fallback | — | **GAP → UAT-30** |
| No screen needs network (explicit) | implicit in UAT-18 | **GAP → UAT-25** |
| Android `habit-reminders` channel | not iOS-relevant | out of scope for iOS UAT |
| `onboarding_completed` analytics event | mentioned inline in UAT-02 | covered |
| `streak_milestone` analytics event | mentioned inline in UAT-07 | covered |

## Scenarios added to uat-plan.md

The following six scenarios were appended to `docs/test-reports/uat-plan.md` under a new section "Coverage additions (from cross-check 2026-05-02)":

- **UAT-25** — App is fully usable with no network connectivity (P0)
  - Closes ProductSpec §6 criterion 8 which was only implicitly covered.
- **UAT-26** — Progress per-habit stats show current, longest, and total (P1)
  - Closes ProductSpec §4.7 / DesignSpec §3.3 (longest streak + total completions previously untested).
- **UAT-27** — Notifications are rescheduled on every app launch (P1)
  - Closes ProductSpec §4.8 reschedule-on-start behavior (was only mentioned inline in UAT-20).
- **UAT-28** — Mark Complete from the habit detail screen (P1)
  - Closes DesignSpec §3.6 view-mode primary button path.
- **UAT-29** — Habit name is required (empty submit blocked) (P2)
  - Closes ProductSpec §4.2 name validation invariant.
- **UAT-30** — Detail screen recovers when the habit is deleted while open (P2)
  - Closes DesignSpec §3.6 not-found fallback.

## Result

- Independent enumeration produced 30+ distinct behaviors.
- 6 gaps vs the original 24 → 6 new scenarios added in-place.
- Plan now totals 30 scenarios.
