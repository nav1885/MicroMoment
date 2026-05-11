# MicroMoment — Regression Suite

Date: 2026-05-02
Phase: post-spec-baseline (run #7 — phased, plan)
Branch: main
Specs: docs/ProductSpec.md, docs/DesignSpec.md, docs/DataModel.md

Priorities:
- **P0** — must pass for any release. Core data correctness, cap, persistence, on-device data integrity.
- **P1** — must pass for a phase to be GO. Primary UX, navigation, theming.
- **P2** — should pass; cosmetic / minor edge cases.

Status legend: `planned` (queued for execute phase), `static` (verified by code read only — no flow), `manual` (no automated coverage available).

| ID  | Pri | Area              | Test                                                                                       | Spec ref          | Flow file / Source                                | Status   |
|-----|-----|-------------------|--------------------------------------------------------------------------------------------|-------------------|---------------------------------------------------|----------|
| R01 | P0  | Onboarding        | First launch with no flag pushes /onboarding modal                                         | PS 4.1 / 5.1      | 00_launch.yaml                                    | planned  |
| R02 | P0  | Onboarding        | Skip / Get Started writes onboarding_complete and lands on Today                           | PS 4.1            | _skip_onboarding.yaml                             | planned  |
| R03 | P0  | Habit CRUD        | Create habit (defaults) appears on Today                                                   | PS 4.2 / 5.2      | 01_add_habit.yaml                                 | planned  |
| R04 | P0  | Habit CRUD        | Create habit with all fields (emoji, name, time-of-day, duration, reminder)                | PS 4.2            | 11_add_habit_full.yaml                            | planned  |
| R05 | P0  | Habit CRUD        | Edit habit — name change persists on Today                                                 | PS 4.2 / 5.4      | 03_edit_habit.yaml                                | planned  |
| R06 | P0  | Habit CRUD        | Delete habit removes from Today and confirms via alert                                     | PS 4.2            | 04_delete_habit.yaml                              | planned  |
| R07 | P0  | Habit CRUD        | 5-habit cap blocks 6th creation; banner / disabled footer button                           | PS 4.2 / 6        | 05_five_habit_cap.yaml                            | planned  |
| R08 | P0  | Daily check-in    | Tap CheckButton marks complete, shows checkmark, opacity drops                             | PS 4.3 / 5.3      | 02_complete_habit.yaml                            | planned  |
| R09 | P0  | Daily check-in    | Double-tap silently prevented (idempotent)                                                 | PS 4.3 / DM 2.4   | 12_double_complete.yaml                           | planned  |
| R10 | P0  | Persistence       | Created habit survives force-quit + relaunch                                               | PS 6              | 13_persistence.yaml                               | planned  |
| R11 | P0  | FK cascade        | Deleting habit also removes its completions                                                | PS 6 / DM 2.4     | db/schema.ts:31 (ON DELETE CASCADE)               | static   |
| R12 | P0  | Atomicity         | One completion per (habit, day) DB-enforced via UNIQUE index + INSERT OR IGNORE            | DM 2.4            | db/schema.ts:52, db/completions.ts:35             | static   |
| R13 | P1  | Streaks           | Streak count appears as 🔥 N when ≥ 2 consecutive days                                      | PS 4.4            | 14_streak_badge.yaml                              | planned  |
| R14 | P1  | Milestone         | Milestone (7/14/21/30/60/90/180/365) triggers confetti                                     | PS 4.4            | 15_milestone_confetti.yaml                        | planned  |
| R15 | P1  | Drag-to-reorder   | Drag handle reorders habits; persists                                                      | PS 4.5            | 16_reorder.yaml                                   | planned  |
| R16 | P1  | Long-press        | 400ms long-press on card opens swipe actions                                               | PS 4.6            | 17_longpress_menu.yaml                            | planned  |
| R17 | P1  | Swipe-left        | Swipe-left on card reveals Edit (green) + Delete (red)                                     | PS 4.6 / DS 2.3   | 03_edit_habit.yaml (partial)                      | planned  |
| R18 | P1  | Detail            | Tap card → Detail screen → Mark Complete → Completed Today                                 | DS 3.6            | 06_habit_detail_view.yaml                         | planned  |
| R19 | P1  | Reminder          | Set reminder via modal; saves with offset                                                  | PS 4.8 / 5.6      | 07_reminder.yaml                                  | planned  |
| R20 | P1  | Reminder          | Reminder rescheduled on every app start                                                    | DM 5              | utils/notifications.ts (rescheduleAllNotifications)| static   |
| R21 | P1  | Progress          | Progress tab renders Last 7 days, Habits list, 8-week heatmap                              | PS 4.7 / DS 3.3   | 08_progress_screen.yaml                           | planned  |
| R22 | P1  | Progress          | Heatmap cells colored by completion ratio (0–4) using heatmap0..4 tokens                   | PS 4.7 / DS 1.1   | constants/colors.ts (heatmap0..4)                 | static   |
| R23 | P1  | Settings          | Settings shows Archived, Version, Reset Onboarding                                         | PS 4.11 / DS 3.4  | 09_settings_screen.yaml                           | planned  |
| R24 | P1  | Archive/restore   | Archive habit removes from Today, appears in Settings, restore returns it                  | PS 4.2 / 5.5      | 10_archive_and_restore.yaml                       | planned  |
| R25 | P1  | Restore cap       | Restore blocked when at 5 active                                                           | PS 4.2 / DM 3.2   | 18_restore_cap_block.yaml                         | planned  |
| R26 | P1  | Daily message     | Today shows daily message from 321-pool                                                    | PS 4.9            | components/DailyMessage.tsx + constants/messages.ts| static   |
| R27 | P1  | Dark mode         | Light/dark themes render every screen with no unreadable contrast                          | PS 4.10 / PS 6    | manual                                            | manual   |
| R28 | P1  | Tabs              | Three tabs (Today/Progress/Settings) navigable; active tint = primary                      | DS 4              | 19_tabs.yaml                                      | planned  |
| R29 | P1  | Onboarding reset  | Settings → Reset Onboarding clears flag and shows onboarding next launch                   | PS 4.11           | 20_reset_onboarding.yaml                          | planned  |
| R30 | P1  | Add Habit footer  | Footer Add Habit button visible; primary-tinted; disabled state at cap (opacity 0.4)       | DS 3.2            | 05_five_habit_cap.yaml + 21_drag_hint.yaml        | planned  |
| R31 | P1  | Save target a11y  | Save / Save changes have stable accessibilityLabel ("Save habit" / "Save changes")          | DS 6              | app/habit/new.tsx:101, app/habit/[id].tsx:228     | static   |
| R32 | P1  | CheckButton size  | CheckButton rendered ≥ 44×44                                                               | DS 2.4 / 6 / HIG  | components/CheckButton.tsx:19 (size=44)           | static   |
| R33 | P2  | Empty state       | No habits → "🌱 No habits yet" empty state with footer Add Habit                            | DS 3.2            | 00_launch.yaml                                    | planned  |
| R34 | P2  | Drag hint         | Drag hint visible only when ≥ 2 habits                                                     | PS 4.5 / DS 3.2   | 21_drag_hint.yaml                                 | planned  |
| R35 | P2  | Reduce motion     | Animations & haptics skipped under Reduce Motion                                            | DS 6              | manual                                            | manual   |
| R36 | P2  | Offline           | App fully functional with airplane mode                                                    | PS 6              | manual                                            | manual   |
| R37 | P2  | Heatmap snap      | Heatmap grid snaps to Monday                                                               | PS 4.7            | app/(tabs)/progress.tsx                           | static   |

## Counts by priority
- P0: 12  (R01–R12)
- P1: 19  (R13–R31; R32 is P1)  → 19 P1 + 1 (R32) = 20
- P2: 5   (R33–R37)
- Total: 37

> Correction: P0=12, P1=20 (R13–R32), P2=5. Grand total 37.

## Carry-forward drift (open)
- D3: EmojiPicker still inlined in `app/habit/new.tsx` and `app/habit/[id].tsx`; no `components/EmojiPicker.tsx` exists. DesignSpec § 2.7 still describes it as a reusable component.
- D5: `Stack.Screen` header overrides live in screen bodies (`new.tsx`, `[id].tsx`) instead of the parent stack. Cosmetic.
- W6 / N1: `grace_used` column on `completions` is vestigial — no UI surfaces it. Either implement grace-day or drop column / DataModel entry.

## Resolved since run #4 (deduped)
- F1 / D1 / #56 — CheckButton size default raised to 44 (commit ec4b977).
- F2 / D2 / #57 — DesignSpec § 3.2 ratified the footer Add Habit button (commit 9e5d03b); no longer drift.
- F3 / #58 — Maestro CLI environment unblock; assume host has Maestro for run #7.
- F4 / #59 — `UNIQUE INDEX uniq_completions_habit_date` + `INSERT OR IGNORE` make markComplete atomic.
- #53 — Maestro flows updated to tap "Save habit" / "Save changes" by accessibilityLabel.
- #54 — `e2e/run_all.sh` device hardcode removed.
- D4 — `amber`, `heatmap0..4` light + dark scales now documented in DesignSpec § 1.1.
