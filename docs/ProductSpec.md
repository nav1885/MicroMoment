# MicroMoment — Product Specification

## 1. Purpose

MicroMoment is a habit-tracking app built around the "5 minutes a day" philosophy: tiny daily actions that compound. The app deliberately constrains scope to keep users focused — a hard cap of 5 active habits, durations of 1–5 minutes each, and a single daily check-in per habit.

## 2. Target user

Individuals who want to build sustainable daily routines without the friction or sprawl of generic habit trackers. The product opinion is that *fewer habits, completed consistently* outperform long lists that are abandoned.

## 3. Core principles

- **Constraint over flexibility.** 5 habits max. 1–5 minute durations. One completion per habit per day.
- **Local-first.** All data lives on-device in SQLite. No account, no cloud sync.
- **Encouragement over guilt.** Streaks and milestone confetti reward consistency; there is no "failure" UI.
- **Calm UI.** Light/dark themes, subtle animation, haptics that respect reduce-motion.

## 4. Feature list

### 4.1 Onboarding
A 3-slide manual-paginated intro shown on first launch:
1. "Five minutes/day"
2. "5 habits max"
3. "Streaks & milestones"
Skippable. Completion writes `onboarding_complete` to AsyncStorage and emits an `onboarding_completed` analytics event. Resettable from Settings.

### 4.2 Habit CRUD
- **Create** (`/habit/new`): emoji (40-emoji palette), name (1–50 chars), time-of-day (morning/afternoon/evening), duration (1–5 min stepper), optional reminder.
- **Read**: Today tab list, detail screen, archived list in Settings.
- **Update** (`/habit/[id]`): same form as create, plus danger zone.
- **Delete**: hard delete with confirmation; cascades to completions.
- **Archive / Restore**: soft delete (`is_active = 0`); restore subject to 5-habit cap.
- **Hard cap**: 5 active habits. Add button disabled at cap; banner displayed.

### 4.3 Daily check-in
Circular check button on each habit card on the Today tab. Single tap marks complete for the current local date. Spring scale animation, haptic feedback, checkmark glyph. Double-completion is silently prevented.

### 4.4 Streaks & milestones
Current streak (consecutive completion days) shown as 🔥 N badge on cards when ≥ 2. Milestone streaks (7, 14, 21, 30, 60, 90, 180, 365) trigger a confetti animation and emit a `streak_milestone` analytics event.

### 4.5 Drag-to-reorder
Long-press a habit card or use the ⋮⋮ drag handle to reorder on the Today tab. Persists to `sort_order`. Hint text shown when ≥ 2 habits.

### 4.6 Swipe & long-press menu
Swipe left on a habit card to reveal Edit (green) and Delete (red) actions. Long-press (400ms) opens the same menu without dragging.

### 4.7 Progress
Progress tab shows:
- Last 7 days summary (dot strip + count).
- Per-habit stats: current streak, longest streak, total completions.
- 8-week heatmap grid (56 days, snapped to Monday). Cells colored 0–4 by daily completion ratio. Week labels on the left.

### 4.8 Per-habit reminders
Optional daily local notification per habit. Configurable time (HH:MM) and offset (0 / 15 / 30 / 60 / 120 min before). Notifications are rescheduled on every app start. Android uses the `habit-reminders` channel with HIGH importance.

### 4.9 Daily motivational message
A rotating message from a 321-entry pool, selected by day-of-year, displayed on the Today tab.

### 4.10 Dark mode
Full light/dark theme support driven by system `useColorScheme()`.

### 4.11 Settings
- Archived Habits list with one-tap restore.
- About: app version (from `expo-application`), reset onboarding action.

## 5. User flows

### 5.1 First launch
App launch → check `onboarding_complete` → if absent, push `/onboarding` modal → user completes or skips → flag set → land on Today tab (empty state).

### 5.2 Add first habit
Today tab → tap "+" → `/habit/new` modal → pick emoji, name, time-of-day, duration, optional reminder → Save → modal dismisses → habit appears on Today tab.

### 5.3 Daily check-in
Today tab → tap check button on a habit → animation + haptic → completion recorded for today → streak updates → if milestone, confetti.

### 5.4 Edit a habit
Today tab → long-press or swipe-left a card → tap Edit → `/habit/[id]?mode=edit` → modify fields → Save.

### 5.5 Archive / Restore
Detail screen → Danger zone → Archive (with confirmation) → habit removed from Today, notification cancelled. Settings → Archived → Restore → habit returns (if under 5-habit cap).

### 5.6 Set a reminder
New / Edit habit → tap Reminder row → modal with hour/minute incrementers + offset pills → Set → schedule registered with Expo Notifications.

## 6. Acceptance criteria

- A user can create a habit and see it on the Today tab in under 30 seconds.
- The app refuses to create or restore a 6th active habit.
- Completing a habit immediately reflects in the streak count and progress heatmap.
- Reminders fire at the configured local time, accounting for the offset, every day.
- Deleting a habit also removes its completions (FK cascade).
- All habit / completion data persists across app restarts and survives device reboot.
- Light and dark themes render every screen without unreadable contrast.
- No screen requires network connectivity to function.

## 7. Non-goals

- Multi-device sync, accounts, social features.
- Habits longer than 5 minutes or more than 5 active habits.
- Multiple completions per habit per day.
- Web or tablet layouts.
