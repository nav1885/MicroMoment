# MicroMoment — Data Model

## 1. Storage

- **Primary store**: SQLite via `expo-sqlite`, database file `micromoment.db`. WAL mode, foreign keys enabled.
- **Secondary store**: AsyncStorage for the `onboarding_complete` flag only.
- **No remote storage.** All data is on-device.

## 2. Schema (`db/schema.ts`)

### 2.1 `habits`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| emoji | TEXT | NOT NULL |
| time_estimate_min | INTEGER | NOT NULL, CHECK 1–5 |
| time_of_day | TEXT | NOT NULL, CHECK in ('morning','afternoon','evening') |
| sort_order | INTEGER | NOT NULL |
| is_active | INTEGER | NOT NULL DEFAULT 1 |
| created_at | TEXT | NOT NULL (ISO 8601) |
| reminder_time | TEXT | nullable, HH:MM |
| reminder_offset_min | INTEGER | nullable, minutes before `reminder_time` |

### 2.2 `completions`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| habit_id | TEXT | NOT NULL, FK → habits(id) ON DELETE CASCADE |
| completed_date | TEXT | NOT NULL, YYYY-MM-DD (local date) |
| completed_at | TEXT | NOT NULL (ISO 8601) |
| note | TEXT | nullable |
| grace_used | INTEGER | NOT NULL DEFAULT 0 |

### 2.3 Indices

- `idx_habits_active` on `habits(is_active)`
- `idx_completions_habit_id` on `completions(habit_id)`
- `idx_completions_date` on `completions(completed_date)`

### 2.4 Invariants

- `is_active = 1` count never exceeds **5** (enforced in store layer, not DB).
- One completion per `(habit_id, completed_date)` is the intended invariant. Enforced at the store layer via `markComplete()` guard; not via DB unique constraint.
- Deleting a habit cascades its completions. Archiving does not delete completions (history is preserved).

## 3. Application state (`store/habitStore.ts`)

Zustand store. Single source of truth for the UI; mirrors a subset of DB state.

### 3.1 State

| Field | Type | Purpose |
|---|---|---|
| habits | `Habit[]` | active habits sorted by `sort_order` |
| todayCompletions | `Completion[]` | completions where `completed_date = today` |
| streaks | `Record<string, number>` | current streak per `habit.id` |
| isLoading | `boolean` | hydration / mutation flag |

### 3.2 Actions

| Action | Effect |
|---|---|
| `loadHabits()` | SELECT active habits ordered by `sort_order` |
| `loadTodayCompletions()` | SELECT completions for today |
| `loadStreaks()` | Compute `calculateStreak()` for each habit |
| `getHabitStreak(id)` | Read from `streaks` |
| `createHabit(input)` | Validate (cap, duration, name); INSERT; schedule notification |
| `updateHabit(id, input)` | Partial UPDATE; reschedule notification |
| `deleteHabit(id)` | DELETE habit (cascade); cancel notification |
| `archiveHabit(id)` | UPDATE `is_active = 0`; cancel notification |
| `restoreHabit(id)` | UPDATE `is_active = 1` (cap check); reschedule notification |
| `reorderHabits(ids)` | UPDATE `sort_order` in transaction |
| `markComplete(id, note?)` | INSERT completion for today (idempotent guard) |
| `getArchivedHabits()` | SELECT inactive habits ordered by `created_at DESC` |

### 3.3 Constants

- `MAX_HABITS = 5`

## 4. Derived calculations (`utils/streakCalculator.ts`)

- **Current streak**: count of consecutive calendar days, ending today or yesterday, on which the habit has at least one completion. Streak does not break until a day is fully missed (i.e., today not yet completed does not zero the streak if yesterday was).
- **Longest streak**: max consecutive run across all completions (used in Progress).
- **Milestones**: streak values in `{7, 14, 21, 30, 60, 90, 180, 365}` trigger UI confetti and analytics.

## 5. Notification linkage (`utils/notifications.ts`)

- Each habit with `reminder_time` set has a daily local notification scheduled with identifier `habit-reminder-{id}`.
- Effective fire time = `reminder_time` minus `reminder_offset_min` minutes (in local timezone).
- On every app start, `_layout.tsx` calls `rescheduleAllNotifications(habits)` which cancels all and re-schedules each active habit.
- Android requires the `habit-reminders` channel (HIGH importance, default sound, vibration `[0,250,250,250]`); created at app init.

## 6. Lifecycle summary

| Event | DB writes | Notification action |
|---|---|---|
| Create habit | INSERT habits | schedule (if reminder set) |
| Update habit | UPDATE habits | cancel + schedule |
| Mark complete | INSERT completions | none |
| Archive | UPDATE habits.is_active=0 | cancel |
| Restore | UPDATE habits.is_active=1 | schedule (if reminder set) |
| Delete | DELETE habits (cascade) | cancel |
| Reorder | UPDATE habits.sort_order | none |
| App start | none | reschedule all active |
