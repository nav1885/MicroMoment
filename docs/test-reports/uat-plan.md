# MicroMoment — User Acceptance Test Plan

**Date:** 2026-05-02
**Source specs:** `docs/ProductSpec.md`, `docs/DesignSpec.md`, `docs/DataModel.md`
**Tester:** Flint (iOS QA)

This document is the human-readable acceptance test plan. Each scenario is a self-contained user story written in Given / When / Then form and can be executed manually on the iOS simulator without referencing any automation file.

---

## Summary

**Total scenarios:** 30 (24 original + 6 added 2026-05-02 via cross-check pass)

**By priority:**
- P0 (must-pass for release): 14
- P1 (important): 11
- P2 (nice-to-have): 5

**Journey sections:**
1. First-time user (UAT-01 → UAT-03)
2. Daily use (UAT-04 → UAT-08)
3. Habit management (UAT-09 → UAT-14)
4. Edge cases & data integrity (UAT-15 → UAT-19)
5. Settings (UAT-20 → UAT-21)
6. Accessibility (UAT-22 → UAT-24)
7. Coverage additions (UAT-25 → UAT-30) — offline operation, Progress stats, notification reschedule, detail-screen completion, name validation, deleted-habit not-found

**Out of scope (per ProductSpec §7):**
- Multi-device sync, accounts, social features
- Habits longer than 5 minutes or more than 5 active habits
- Multiple completions per habit per day
- Web or tablet layouts
- Network-dependent features (app is fully offline-first)

---

## First-time user

### UAT-01 — See onboarding on first launch

**As a** brand-new user
**I want to** be introduced to the app's philosophy on first launch
**So that** I understand the "5 minutes a day" constraint before I start

**Given** the app has never been launched (AsyncStorage `onboarding_complete` is absent)
**When** I open the app for the first time
**Then** the 3-slide onboarding screen appears as a modal with a primary-green background
**And** the slides cover, in order, the five-minute daily action, the five-habit focus cap, and the streaks/milestones idea (current copy: "Five minutes. Every day. That's it.", "Pick up to 5 habits to focus on.", "Check in daily. Build streaks. Grow.")
**And** dot indicators show my position, a Next button advances slides, and a Skip button is visible top-right
**And** the modal cannot be swiped down to dismiss (`gestureEnabled: false` on the onboarding stack screen)

**Spec ref:** ProductSpec §4.1, §5.1; DesignSpec §3.1, §4
**Priority:** P0

---

### UAT-02 — Complete onboarding and land on empty Today tab

**As a** new user
**I want to** finish onboarding and arrive at the main screen
**So that** I can start adding my habits

**Given** I am on slide 1 of onboarding
**When** I tap Next twice to reach slide 3, then tap "Get Started"
**Then** the onboarding modal dismisses
**And** I land on the Today tab with an empty state prompt
**And** an Add Habit button is visible as the list footer
**And** an `onboarding_completed` analytics event has fired
**And** relaunching the app skips onboarding entirely

**Spec ref:** ProductSpec §4.1, §5.1; DesignSpec §3.2
**Priority:** P0

---

### UAT-03 — Skip onboarding

**As a** returning user familiar with habit apps
**I want to** skip the intro
**So that** I can go straight to adding habits

**Given** I am on slide 1 of onboarding
**When** I tap Skip in the top-right corner
**Then** the onboarding modal dismisses immediately
**And** I land on the Today tab empty state
**And** `onboarding_complete` is persisted, so a subsequent app launch goes straight to Today

**Spec ref:** ProductSpec §4.1
**Priority:** P1

---

## Daily use

### UAT-04 — Add my first habit in under 30 seconds

**As a** user with no habits yet
**I want to** create a habit quickly
**So that** I can begin tracking immediately

**Given** I am on the Today tab with the empty state visible
**When** I tap the Add Habit footer button
**And** the New Habit modal opens, I pick an emoji from the palette, type a name ("Meditate"), pick a time-of-day pill ("morning"), set duration to 5 minutes, and tap Save
**Then** the modal dismisses within 30 seconds of starting
**And** the habit appears on the Today tab with its emoji, name, duration meta, and an unchecked CheckButton
**And** the data persists across an app restart

> Drift D6 resolved: `components/HabitCard.tsx` now renders `"{N} min · 🌅 Morning"` (etc) via `TIME_OF_DAY_META`.

**Spec ref:** ProductSpec §4.2, §5.2, §6 (criterion 1); DesignSpec §3.5, §2.3
**Priority:** P0

---

### UAT-05 — Check in a habit for today

**As a** user with at least one active habit
**I want to** mark it complete with one tap
**So that** my streak progresses

**Given** I am on the Today tab and a habit is showing an empty CheckButton
**When** I tap the CheckButton once
**Then** the button springs from scale 1 → 1.3 → 1, fills primary green, and shows a white checkmark
**And** I feel a haptic impact (unless Reduce Motion is on)
**And** the card dims to opacity 0.45 with completedText color
**And** if this completion creates a streak ≥ 2, a 🔥 N badge appears on the card

**Spec ref:** ProductSpec §4.3, §5.3; DesignSpec §2.4, §3.2
**Priority:** P0

---

### UAT-06 — Streak count and heatmap update immediately after check-in

**As a** user who just checked in
**I want to** see my streak and progress reflect the completion right away
**So that** I trust the data is captured

**Given** I have an active habit with a current streak of 1 (yesterday completed)
**When** I tap the CheckButton on the Today tab to complete it for today
**And** I switch to the Progress tab
**Then** the current streak for that habit reads 2
**And** today's cell in the 8-week heatmap is colored at the appropriate intensity
**And** the last-7-days dot strip shows today filled in

**Spec ref:** ProductSpec §6 (criterion 3), §4.4, §4.7; DesignSpec §3.3
**Priority:** P0

---

### UAT-07 — Milestone confetti at 7-day streak

**As a** consistent user
**I want to** be celebrated on milestone streaks
**So that** I feel encouraged to continue

**Given** I have a habit with a 6-day current streak (yesterday was day 6)
**When** I tap the CheckButton today
**Then** a confetti animation fires from top-center with ~120 particles falling over ~3 seconds
**And** the 🔥 badge updates to 🔥 7
**And** a `streak_milestone` analytics event is emitted with the streak value 7
**And** if Reduce Motion is on, the confetti is suppressed but the badge still updates

> Drift D7 resolved: confetti and CheckButton spring now gated via `hooks/useReduceMotion.ts` (`app/(tabs)/index.tsx`, `components/CheckButton.tsx`).

**Spec ref:** ProductSpec §4.4; DesignSpec §5 (Confetti), §8
**Priority:** P1

---

### UAT-08 — Daily motivational message rotates

**As a** user opening the app
**I want to** see a small dose of encouragement
**So that** the app feels warm

**Given** I open the Today tab on any given date
**Then** a single-line motivational message is rendered in the header below the date string
**And** opening the app on a different day shows a different message (selection is by day-of-year from a fixed `DAILY_MESSAGES` pool of ~320 entries in `constants/messages.ts`)

> Drift note (D8): ProductSpec §4.9 and DesignSpec §2.6 both state 321 entries. Actual pool size is 319 (`grep -E '^  "' constants/messages.ts | wc -l`). Rotation behavior is the testable property; exact count is a docs nit.

**Spec ref:** ProductSpec §4.9; DesignSpec §2.6, §3.2
**Priority:** P2

---

## Habit management

### UAT-09 — Edit a habit via swipe-left

**As a** user
**I want to** edit a habit from the Today tab without navigating into detail first
**So that** I can fix mistakes quickly

**Given** I am on the Today tab with at least one habit
**When** I swipe a habit card to the left
**Then** Edit (green) and Delete (red) actions are revealed on the right side
**When** I tap Edit
**Then** the habit edit screen opens in edit mode (`/habit/[id]?mode=edit`) with all fields prefilled
**When** I change the name and tap Save in the header
**Then** I return to the Today tab and the card shows the new name

**Spec ref:** ProductSpec §4.6, §5.4; DesignSpec §2.3, §3.6
**Priority:** P0

---

### UAT-10 — Long-press a card to reveal action menu

**As a** user who prefers gestures over swipes
**I want to** long-press a card to access Edit and Delete
**So that** I can manage habits without a swipe

**Given** I am on the Today tab with at least one habit
**When** I press and hold a habit card for 400ms
**Then** the same Edit / Delete action menu revealed by swipe-left appears
**And** releasing without selecting closes the menu

**Spec ref:** ProductSpec §4.6; DesignSpec §2.3, §5
**Priority:** P1

---

### UAT-11 — Drag to reorder habits

**As a** user with multiple habits
**I want to** drag them into my preferred order
**So that** the most important habit is on top

**Given** I have ≥ 2 active habits on the Today tab
**Then** the list header shows the hint "Hold to reorder"
**When** I long-press a card or grab its ⋮⋮ drag handle and drag it to a new position
**Then** the list reorders visually as I drag and snaps into place on release
**And** the new order persists across an app restart (written to `sort_order`)

**Spec ref:** ProductSpec §4.5; DesignSpec §5, DataModel §3.2 (`reorderHabits`)
**Priority:** P1

---

### UAT-12 — Delete a habit with confirmation

**As a** user
**I want to** be asked to confirm before deleting a habit
**So that** I don't lose my history accidentally

**Given** I have a habit with several completions
**When** I swipe left on the card and tap Delete
**Then** a confirmation alert appears warning that deletion is permanent
**When** I confirm
**Then** the habit disappears from the Today tab
**And** all its completions are removed from the database (FK cascade)
**And** the heatmap and per-habit stats on the Progress tab no longer include it

**Spec ref:** ProductSpec §4.2, §6 (criterion 5); DataModel §2.2, §2.4
**Priority:** P0

---

### UAT-13 — Archive a habit from the detail screen

**As a** user pausing a habit
**I want to** archive it rather than delete
**So that** I preserve my completion history

**Given** I open a habit's detail screen and tap Edit
**When** I scroll to the Danger zone and tap Archive, confirming the alert
**Then** the habit disappears from the Today tab
**And** its scheduled notification (if any) is cancelled
**And** its completions remain in the database (history preserved per DataModel §2.4)
**And** the habit now appears in Settings → Archived Habits

**Spec ref:** ProductSpec §4.2, §5.5; DataModel §2.4, §6
**Priority:** P0

---

### UAT-14 — Restore an archived habit

**As a** user resuming a paused habit
**I want to** restore it from Settings
**So that** it comes back to my Today tab

**Given** I have an archived habit and fewer than 5 active habits
**When** I open Settings → Archived Habits and tap Restore on the row
**Then** the habit reappears on the Today tab
**And** its notification (if a reminder time is set) is rescheduled
**And** its preserved completions show up again in Progress

**Spec ref:** ProductSpec §4.2, §5.5; DataModel §3.2, §6
**Priority:** P1

---

## Edge cases & data integrity

### UAT-15 — 5-habit cap prevents creating a 6th

**As a** user respecting the app's constraint philosophy
**I want to** be stopped from adding a 6th habit
**So that** I stay focused

**Given** I have 5 active habits on the Today tab
**Then** the Add Habit footer button shows opacity 0.4 with secondary-text color and is disabled (`accessibilityState.disabled = true`)
**When** I tap it
**Then** nothing happens — no haptic, no navigation
**And** the cap banner / disabled state communicates that the limit has been reached

**Spec ref:** ProductSpec §4.2, §6 (criterion 2); DesignSpec §3.2; DataModel §3.3
**Priority:** P0

---

### UAT-16 — 5-habit cap also blocks restoring a 6th

**As a** user at the cap
**I want to** be prevented from restoring an archived habit that would exceed the cap
**So that** the 5-habit invariant is never violated

**Given** I have 5 active habits and at least 1 archived habit
**When** I open Settings → Archived Habits and tap Restore
**Then** the restore is refused (no state change) and I receive feedback that the cap is reached
**And** the active count remains 5

**Spec ref:** ProductSpec §4.2, §6 (criterion 2); DataModel §3.2 (`restoreHabit` cap check)
**Priority:** P0

---

### UAT-17 — Double-tap on CheckButton does not double-complete

**As a** user
**I want to** be unable to accidentally complete the same habit twice on the same day
**So that** my streak math stays correct

**Given** I have an active habit not yet completed today
**When** I tap the CheckButton twice in rapid succession
**Then** only one completion is recorded for today (verified via Progress totals or DB)
**And** the second tap is silently ignored (no error, no extra haptic)
**And** the card remains in the completed visual state

**Spec ref:** ProductSpec §4.3, §7; DataModel §2.4, §3.2 (`markComplete` idempotent guard)
**Priority:** P0

---

### UAT-18 — Data survives app restart and device reboot

**As a** user trusting a local-first app
**I want to** never lose data
**So that** my streaks are real

**Given** I have created habits, recorded completions, and reordered the list
**When** I force-quit the app and relaunch it
**Then** all habits, completions, sort order, streaks, and reminder settings are intact
**When** I reboot the device and relaunch
**Then** the same data is still intact (SQLite WAL flushed correctly)
**And** no network connection is required to render any screen

**Spec ref:** ProductSpec §6 (criteria 6, 8); DataModel §1
**Priority:** P0

---

### UAT-19 — Deleting a habit cascades its completions

**As a** developer-conscious user
**I want to** know that deleting a habit fully removes its data
**So that** there are no orphan rows or ghost heatmap cells

**Given** I have a habit with multiple completions across the last 30 days
**When** I delete the habit (confirmed) from swipe-left → Delete
**Then** the `habits` row is removed
**And** every `completions` row with that `habit_id` is removed via ON DELETE CASCADE
**And** the Progress tab no longer references the habit anywhere

**Spec ref:** ProductSpec §6 (criterion 5); DataModel §2.2, §2.4
**Priority:** P0

---

## Settings

### UAT-20 — Schedule a per-habit reminder

**As a** user who needs nudges
**I want to** set a daily reminder time and offset
**So that** the habit is on my mind

**Given** I am creating or editing a habit
**When** I tap the Reminder row
**Then** the ReminderModal opens with hour/minute incrementers and a row of offset pills with the exact labels `At time`, `15 min`, `30 min`, `1 hr`, `2 hrs`
**When** I set 09:00, tap the `15 min` offset pill, and tap the `Set Reminder` button
**Then** the row shows the configured reminder (formatted as "09:00 · 15 min before")
**And** on save, a daily local notification is scheduled with identifier `habit-reminder-{id}`
**And** the effective fire time is 08:45 local time, every day
**And** on the next app launch, `rescheduleAllNotifications` re-registers the same schedule

**Spec ref:** ProductSpec §4.8, §5.6, §6 (criterion 4); DesignSpec §2.8; DataModel §5
**Priority:** P0

---

### UAT-21 — Reset onboarding from Settings

**As a** user demonstrating the app to a friend
**I want to** replay the onboarding
**So that** they see the intro

**Given** I am on Settings → ABOUT
**When** I tap the "Reset onboarding" row (lowercase "o" in the visible label, per `app/(tabs)/settings.tsx:118`)
**Then** a confirmation alert ("Reset onboarding?") appears
**When** I confirm Reset
**Then** `onboarding_complete` is cleared from AsyncStorage and the app immediately replaces the route to `/onboarding`
**And** subsequently force-quitting and relaunching the app also lands me back on slide 1 of the 3-slide onboarding modal

**Spec ref:** ProductSpec §4.1, §4.11
**Priority:** P2

---

## Accessibility

### UAT-22 — Dark mode renders every screen readably

**As a** user with the system in dark mode
**I want to** every screen to use dark theme tokens
**So that** the app is not blinding at night

**Given** my iOS system appearance is set to Dark
**When** I open the app and visit Today, Progress, Settings, New Habit, and Habit Detail
**Then** every screen uses dark theme tokens (background #121212, surface #1E1E1E, text #F5F5F5)
**And** text contrast meets WCAG AA against its background on every screen
**And** the heatmap uses the dark scale (#1A1F2E → #0A84FF)
**And** switching system appearance back to Light updates the UI live without a restart

**Spec ref:** ProductSpec §4.10, §6 (criterion 7); DesignSpec §1.1
**Priority:** P0

---

### UAT-23 — Reduce Motion suppresses animations and haptics

**As a** user with motion sensitivity who has enabled Reduce Motion
**I want to** the app to skip springs, scales, confetti, and haptics
**So that** I can use the app without discomfort

**Given** Settings → Accessibility → Reduce Motion is ON
**When** I tap a CheckButton, tap a primary Button, or hit a streak milestone
**Then** there is no spring scale animation on press
**And** there is no haptic impact
**And** no confetti is rendered on milestone completion
**And** the underlying state changes (completion recorded, streak updated, badge shown) all still occur

**Spec ref:** DesignSpec §2.2, §6, §8
**Priority:** P1

---

### UAT-24 — Tap targets and accessibility labels

**As a** user relying on VoiceOver or with reduced dexterity
**I want to** every interactive element to be reachable and announced
**So that** I can use the app without precision taps

**Given** I navigate the app with VoiceOver enabled
**Then** the CheckButton, drag handle, tab icons, Add Habit button, Save / Close header buttons, and swipe actions are all ≥ 40×40 points
**And** each interactive control exposes a meaningful accessibilityLabel (e.g. habit name, "Mark complete", "Delete")
**And** the Add Habit button at the 5-habit cap announces its disabled state
**And** the reading order on each screen is logical top-to-bottom

**Spec ref:** DesignSpec §6; ProductSpec §4 (general)
**Priority:** P1

---

## Coverage additions (from cross-check 2026-05-02)

### UAT-25 — App is fully usable with no network connectivity

**As a** local-first user
**I want to** open and use every screen with no network
**So that** I can trust the "no cloud" promise

**Given** I have habits, completions, reminders, and archived entries already created
**When** I put the device into Airplane Mode and cold-launch the app
**Then** Onboarding (if reset), Today, Progress, Settings, New Habit, and Habit Detail/Edit all render without errors or blank states
**And** I can complete a habit, create a habit, edit a habit, archive/restore a habit, and reorder habits with no spinner or error toast
**And** no outbound network request is made (verified via Charles/Proxyman or by observing that the app does not stall on launch)

**Spec ref:** ProductSpec §6 (criterion 8), §3 ("Local-first")
**Priority:** P0

---

### UAT-26 — Progress per-habit stats show current, longest, and total

**As a** user who wants to see how I'm trending
**I want to** the Progress tab to show me my current streak, longest streak, and total completions per habit
**So that** I have something to look back on

**Given** I have ≥ 1 active habit with several completions, including a past streak run
**When** I open the Progress tab
**Then** for each habit the row shows the emoji pill, the habit name, "🔥 N" (current streak), "Best M" (longest streak), and "K done" (total completions)
**And** the values match what `utils/streakCalculator.calculateStreak()` computes over the habit's completion-date list
**And** when no habits exist, the empty prompt "Add habits on the Today tab to see your progress here." appears instead

**Spec ref:** ProductSpec §4.7; DesignSpec §3.3; DataModel §4
**Priority:** P1

---

### UAT-27 — Notifications are rescheduled on every app launch

**As a** user with a configured reminder
**I want to** every cold launch to re-register my reminders
**So that** OS-level cancellation or clock changes don't silently lose them

**Given** I have ≥ 1 active habit with `reminder_time` set
**When** I cold-launch the app
**Then** `rescheduleAllNotifications(habits)` runs from `app/_layout.tsx:30–36`
**And** all previously scheduled `habit-reminder-{id}` notifications are cancelled, then re-scheduled for each active habit with a reminder
**And** verifying via Expo Notifications list (`getAllScheduledNotificationsAsync()`) shows one entry per habit with a reminder

**Spec ref:** ProductSpec §4.8; DataModel §5
**Priority:** P1

---

### UAT-28 — Mark Complete from the habit detail screen

**As a** user viewing a habit detail
**I want to** complete the habit directly from the detail screen
**So that** I don't have to back out to the Today tab

**Given** I open a habit's detail screen and it is not yet completed today
**When** I tap the "Mark Complete" primary button
**Then** the completion is recorded, the button switches to "Completed Today" (disabled, secondary variant)
**And** returning to the Today tab shows the habit in its completed state (opacity 0.45, checkmark filled)
**And** tapping again while in the "Completed Today" state does nothing (disabled)

**Spec ref:** DesignSpec §3.6; ProductSpec §4.3
**Priority:** P1

---

### UAT-29 — Habit name is required (empty submit blocked)

**As a** user
**I want to** be prevented from creating a nameless habit
**So that** my list stays meaningful

**Given** I am on the New Habit modal with all fields default except the name left blank (or whitespace-only)
**When** I tap Save in the header
**Then** an alert appears ("Name required — Give your habit a name.")
**And** no habit is inserted (`habits` row count unchanged)
**And** the modal stays open with focus retained
**When** I type a 1-character name and re-save, the habit is created
**And** the name field caps input at 50 characters (`maxLength={50}` on the TextInput)

**Spec ref:** ProductSpec §4.2 ("name 1–50 chars")
**Priority:** P2

---

### UAT-30 — Detail screen recovers when the habit is deleted while open

**As a** user
**I want to** not see a crash if the habit I'm viewing gets deleted from elsewhere (or by me from the danger zone)
**So that** the app stays stable

**Given** I open a habit's detail screen, then tap Edit → Danger zone → Delete and confirm
**Then** the screen routes back to the previous tab
**When** I navigate by URL/state directly to `/habit/{deletedId}` (e.g. via a stale deep link)
**Then** the detail screen renders the "Habit not found." fallback with a Back button (`app/habit/[id].tsx:177–196`)
**And** no crash, white screen, or unhandled error occurs

**Spec ref:** DesignSpec §3.6 ("Falls back to 'not found' state if habit was deleted while open")
**Priority:** P2

---

## Coverage cross-reference

**ProductSpec §5 user flows:**
- §5.1 First launch → UAT-01, UAT-02
- §5.2 Add first habit → UAT-04
- §5.3 Daily check-in → UAT-05, UAT-06
- §5.4 Edit a habit → UAT-09
- §5.5 Archive / Restore → UAT-13, UAT-14
- §5.6 Set a reminder → UAT-20

**ProductSpec §6 acceptance criteria (all 8):**
1. Habit creation in under 30 seconds → UAT-04
2. Refuses 6th active habit (create or restore) → UAT-15, UAT-16
3. Completion reflects in streak and heatmap → UAT-06
4. Reminders fire at configured time with offset → UAT-20
5. Deletion cascades completions → UAT-12, UAT-19
6. Data persists across restart and reboot → UAT-18
7. Light/dark themes render readably → UAT-22
8. No screen needs network → UAT-25 (explicit airplane-mode); UAT-18 (implicit)

**DataModel invariants:**
- 5-habit cap → UAT-15, UAT-16
- Single completion per (habit, date) → UAT-17
- FK cascade on delete → UAT-12, UAT-19
- Archiving preserves completions → UAT-13

**DesignSpec key interactions:**
- Swipe-to-delete / swipe-to-edit → UAT-09, UAT-12
- Long-press menu → UAT-10
- Drag-to-reorder → UAT-11
- Milestone confetti → UAT-07
- Dark mode → UAT-22
- Reduce Motion → UAT-23
