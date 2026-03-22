#!/bin/bash

# MicroMoment — GitHub Issues & Project Setup Script
# Repo: nav1885/MicroMoment
# Run with: bash setup_micromoment.sh
# Prerequisites: gh CLI installed and authenticated (gh auth login)

REPO="nav1885/MicroMoment"

echo "=========================================="
echo " MicroMoment — GitHub Project Setup"
echo " Repo: $REPO"
echo "=========================================="
echo ""

# ── Verify gh CLI ──────────────────────────────────────────────────────────
if ! command -v gh &> /dev/null; then
  echo "ERROR: GitHub CLI (gh) is not installed."
  echo "Install from https://cli.github.com then run: gh auth login"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "ERROR: Not authenticated. Run: gh auth login"
  exit 1
fi

echo "✓ GitHub CLI authenticated"
echo ""

# ── Update repo description ────────────────────────────────────────────────
echo "Setting repo description..."
gh repo edit "$REPO" \
  --description "MicroMoment — 5-minute micro habit builder for iOS and Android. Free, simple, capped at 5 habits on purpose." \
  --homepage "" 2>/dev/null || true
echo "✓ Repo description set"
echo ""

# ── Clean default labels ───────────────────────────────────────────────────
echo "Cleaning default labels..."
for label in "bug" "documentation" "duplicate" "enhancement" "good first issue" "help wanted" "invalid" "question" "wontfix"; do
  gh label delete "$label" --repo "$REPO" --yes 2>/dev/null || true
done
echo "✓ Default labels removed"
echo ""

# ── Create labels ──────────────────────────────────────────────────────────
echo "Creating labels..."

# Phase
gh label create "phase-1" --repo "$REPO" --color "0075CA" --description "Phase 1: Foundation & Core Loop" 2>/dev/null || true
gh label create "phase-2" --repo "$REPO" --color "0075CA" --description "Phase 2: Streaks & Progress" 2>/dev/null || true
gh label create "phase-3" --repo "$REPO" --color "0075CA" --description "Phase 3: Notifications & Onboarding" 2>/dev/null || true
gh label create "phase-4" --repo "$REPO" --color "0075CA" --description "Phase 4: Polish & Release" 2>/dev/null || true

# Type
gh label create "core"        --repo "$REPO" --color "E4E669" --description "Core app logic" 2>/dev/null || true
gh label create "ui"          --repo "$REPO" --color "0E8A16" --description "UI components and screens" 2>/dev/null || true
gh label create "data"        --repo "$REPO" --color "D93F0B" --description "SQLite, state, persistence" 2>/dev/null || true
gh label create "testing"     --repo "$REPO" --color "5319E7" --description "Tests and QA" 2>/dev/null || true
gh label create "devops"      --repo "$REPO" --color "B60205" --description "Build, CI, release" 2>/dev/null || true
gh label create "ios"         --repo "$REPO" --color "555555" --description "iOS specific" 2>/dev/null || true
gh label create "android"     --repo "$REPO" --color "44CC11" --description "Android specific" 2>/dev/null || true

# Priority
gh label create "p0" --repo "$REPO" --color "B60205" --description "Critical — blocks everything" 2>/dev/null || true
gh label create "p1" --repo "$REPO" --color "E4E669" --description "High priority" 2>/dev/null || true
gh label create "p2" --repo "$REPO" --color "CCCCCC" --description "Nice to have" 2>/dev/null || true

# Status
gh label create "todo"        --repo "$REPO" --color "CCCCCC" --description "Not started" 2>/dev/null || true
gh label create "in-progress" --repo "$REPO" --color "0075CA" --description "Actively being worked on" 2>/dev/null || true
gh label create "done"        --repo "$REPO" --color "0E8A16" --description "Completed" 2>/dev/null || true

echo "✓ All labels created"
echo ""

# ── Helper ─────────────────────────────────────────────────────────────────
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  echo "  Creating: $title"
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels" 2>/dev/null
  sleep 0.5
}

# ── Requirements doc as issue #1 ───────────────────────────────────────────
echo "Creating Product Requirements Document issue..."

create_issue \
"[PRD] MicroMoment — Product Requirements Document" \
"## Product Overview

MicroMoment is a free iOS and Android habit-building app with one core rule: every habit must be completable in under 5 minutes. The app is intentionally capped at 5 habits. This is not a limitation — it is the product philosophy.

> *\"Five habits is your limit — and that's the point. Master these before adding more.\"*

The app is fully free. No paywall. No IAP. No ads. The 5-habit cap is a hard product constraint, not a monetisation gate.

---

## Problem Statement

Habit apps fail users because they ask too much. Large goals, complex dashboards, and infinite habit lists create anxiety instead of progress. MicroMoment solves this by enforcing radical simplicity — if you can't do it in 5 minutes, it doesn't belong here.

---

## Target Users

**Primary — The Lapsed Self-Improver**
- Age 26–38, knowledge worker
- Has downloaded 3+ habit apps, uses each for 2 weeks, then quits
- Wants to feel in control of small daily routines
- Needs: simplicity, forgiveness, no guilt

**Secondary — The Health-Conscious Beginner**
- Age 22–30, student or early-career
- Gets overwhelmed by large goals
- Needs: small wins, easy entry, low commitment

---

## Core Product Rules (Non-Negotiable)

| Rule | Detail |
|------|--------|
| 5-minute cap | Every habit must be 1–5 minutes. Enforced at creation. No exceptions. |
| 5-habit cap | Maximum 5 active habits per user. Hard limit. Friendly message, not a paywall. |
| One check-in screen | Home screen is the daily check-in and nothing else. |
| Fully free | No IAP, no subscription, no ads, no RevenueCat. |
| Offline-first | All features work with zero internet connection. |

---

## Features — v1.0 Scope

### Onboarding (3 screens, no account required)
- Screen 1: Value prop — *'Five minutes. Every day. That's it.'*
- Screen 2: Create first habit — suggestion chips (Drink water, Stretch, Meditate, Journal, Walk outside)
- Screen 3: Set reminder time — Morning / Afternoon / Evening

### Home Screen — Daily Check-In
- All active habits grouped by time of day
- Completion ring showing today's progress (e.g. 3/5 done)
- Tap check button → haptic pulse + bloom animation → card greys out
- Motivational micro-message (curated set of 365, rotated daily)

### Habit Creation
- Fields: name (max 50 chars), emoji icon, time estimate (1–5 min), time of day
- At 5 active habits: show friendly cap message — *'You have 5 habits. Focus on mastering these first.'*
- No paywall. No upsell. Just the message.

### Habit Detail
- Current streak with flame icon
- 12-week calendar heatmap
- 30-day completion rate
- Edit and delete options
- Last 5 quick notes (optional)

### Streak & Grace Period
- Streak tracked per habit
- One missed day does not break streak (grace period — usable once per 7 days)
- Two consecutive missed days breaks the streak
- Milestone celebrations at 7, 21, 30, 60, 100 days

### Progress Screen
- 7-day completion rate per habit (horizontal bar chart)
- Overall weekly score as a percentage
- 12-week calendar heatmap

### Notifications
- Daily reminder per time group (Morning / Afternoon / Evening)
- User sets preferred time per group in onboarding
- If all habits in a group are completed, that day's notification is cancelled

---

## Features — Explicitly Out of Scope (v1.0)

- Social features, friends, leaderboards
- AI-generated habit suggestions
- Apple Health / Google Fit integration
- Web app or desktop version
- Team or corporate accounts
- In-app purchases or subscription
- Ads of any kind

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native via Expo SDK 51+ |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Database | Expo SQLite (on-device, offline-first) |
| Notifications | Expo Notifications |
| Animations | React Native Reanimated |
| Haptics | Expo Haptics |
| Analytics | PostHog (anonymous events only) |
| Crash monitoring | Sentry for React Native |
| Build & release | EAS Build + EAS Submit |
| Testing | Jest + React Native Testing Library + Detox |

---

## Database Schema

### Table: habits
\`\`\`
id                TEXT  PRIMARY KEY (UUID v4)
name              TEXT  NOT NULL (max 50 chars)
emoji             TEXT  NOT NULL
time_estimate_min INT   NOT NULL (1–5)
time_of_day       TEXT  NOT NULL ('morning' | 'afternoon' | 'evening')
sort_order        INT   NOT NULL
is_active         INT   NOT NULL (1 = active, 0 = archived)
created_at        TEXT  NOT NULL (ISO 8601)
notify_time       TEXT  NULLABLE (HH:MM)
\`\`\`

### Table: completions
\`\`\`
id             TEXT  PRIMARY KEY (UUID v4)
habit_id       TEXT  FK → habits.id (cascade delete)
completed_date TEXT  NOT NULL (YYYY-MM-DD)
completed_at   TEXT  NOT NULL (ISO 8601)
note           TEXT  NULLABLE (max 140 chars)
grace_used     INT   NOT NULL (1 if grace day)
\`\`\`

---

## Streak Algorithm

1. Fetch all completions for habit ordered by date DESC
2. Walk backwards day by day from yesterday (or today if checked in)
3. Date has completion → continue, increment counter
4. Date has no completion + no grace used in last 7 days → apply grace, continue
5. Date has no completion + grace already used → break, return count
6. Returns: \`{ currentStreak, longestStreak, graceAvailable }\`

---

## Success Metrics (Year 1)

| Metric | Target |
|--------|--------|
| Monthly Active Users | 10,000 |
| Day-30 Retention | > 35% |
| App Store Rating | ≥ 4.5 stars |
| Avg check-in time | < 30 seconds |
| Crash-free rate | > 99.5% |

---

## Implementation Phases

| Phase | Name | Duration |
|-------|------|----------|
| 1 | Foundation & Core Loop | 2–3 weeks |
| 2 | Streaks & Progress | 1–2 weeks |
| 3 | Notifications & Onboarding | 1 week |
| 4 | Polish & Release | 1–2 weeks |

**Total estimated: 5–8 weeks with Claude Code**

---

## App Store Metadata

| Field | Value |
|-------|-------|
| App Name | MicroMoment: 5-Min Habit Tracker |
| Subtitle (iOS) | Tiny habits. Real streaks. |
| Category | Health & Fitness (primary), Productivity (secondary) |
| Keywords | habit tracker, daily routine, streak, micro habits, 5 minute habits |
| Price | Free |" \
"phase-1,phase-2,phase-3,phase-4,core,p0,todo"

echo "✓ PRD issue created"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 1 — FOUNDATION & CORE LOOP
# ══════════════════════════════════════════════════════════════════════════════
echo "Creating Phase 1 issues — Foundation & Core Loop..."

create_issue \
"[P1-01] Expo project scaffold and folder structure" \
"## Overview
Set up the Expo + React Native project with TypeScript, Expo Router, and all required dependencies. This is the foundation everything else is built on.

## Tasks
- Initialise Expo project: \`npx create-expo-app MicroMoment --template expo-template-blank-typescript\`
- Install dependencies:
  - \`expo-router\` — file-based navigation
  - \`zustand\` — state management
  - \`expo-sqlite\` — on-device database
  - \`expo-notifications\` — push notifications
  - \`expo-haptics\` — haptic feedback
  - \`react-native-reanimated\` — animations
  - \`@sentry/react-native\` — crash monitoring
  - \`posthog-react-native\` — anonymous analytics
- Create folder structure:
\`\`\`
app/
  (tabs)/
    index.tsx         ← Home / daily check-in
    progress.tsx      ← Weekly/monthly progress
    settings.tsx      ← App settings
  habit/[id].tsx      ← Habit detail screen
  onboarding.tsx      ← First-run flow
_layout.tsx
components/
store/
  habitStore.ts
db/
  schema.ts
  habits.ts
  completions.ts
hooks/
utils/
constants/
  colors.ts
  typography.ts
\`\`\`
- Create \`constants/colors.ts\` with brand palette: primary green \`#4F7942\`, background \`#FAFAFA\`, dark \`#1A1A1A\`
- Add \`app.json\` configuration: name, slug, bundle identifier \`com.nav1885.micromoment\`
- Add \`.gitignore\` covering \`node_modules\`, \`.env\`, \`*.orig.*\`
- Create \`README.md\` with local dev setup instructions

## Acceptance Criteria
- [ ] \`npx expo start\` runs without errors
- [ ] App loads on iOS Simulator and Android Emulator
- [ ] Expo Router navigation structure in place
- [ ] All dependencies installed with no peer dependency conflicts
- [ ] TypeScript strict mode enabled — \`tsc --noEmit\` passes
- [ ] Folder structure matches spec above
- [ ] \`constants/colors.ts\` exported and importable" \
"phase-1,core,p0,todo"

create_issue \
"[P1-02] SQLite database schema and query layer" \
"## Overview
Implement the SQLite database schema and all query functions using Expo SQLite. This is the persistence layer for all habit and completion data.

## Context
All data lives on-device. There is no backend. The DB must be initialised on first app launch and must be resilient to schema changes via migrations.

## Schema

### habits table
\`\`\`sql
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  time_estimate_min INTEGER NOT NULL CHECK(time_estimate_min BETWEEN 1 AND 5),
  time_of_day TEXT NOT NULL CHECK(time_of_day IN ('morning','afternoon','evening')),
  sort_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  notify_time TEXT
);
\`\`\`

### completions table
\`\`\`sql
CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  note TEXT,
  grace_used INTEGER NOT NULL DEFAULT 0
);
\`\`\`

## Files to implement
- \`db/schema.ts\` — initialiseDatabase(), runs CREATE TABLE IF NOT EXISTS on startup
- \`db/habits.ts\` — insertHabit(), updateHabit(), deleteHabit(), archiveHabit(), getAllActiveHabits(), reorderHabits()
- \`db/completions.ts\` — insertCompletion(), getCompletionsForHabit(), getTodayCompletions(), getCompletionsByDateRange()

## Rules
- All IDs are UUID v4 (use \`crypto.randomUUID()\`)
- \`time_estimate_min\` must be 1–5 — enforce at DB level with CHECK constraint AND at store level
- Active habit count must never exceed 5 — enforced in store, not at DB level
- All dates stored as ISO 8601 strings

## Acceptance Criteria
- [ ] \`initialiseDatabase()\` runs on app start without errors
- [ ] \`insertHabit()\` correctly writes all fields to DB
- [ ] \`getAllActiveHabits()\` returns only habits with \`is_active = 1\`
- [ ] \`insertCompletion()\` correctly links to habit via \`habit_id\`
- [ ] \`getTodayCompletions()\` returns only completions for today's local date
- [ ] Cascade delete: deleting a habit removes all its completions
- [ ] CHECK constraint rejects \`time_estimate_min\` outside 1–5 range
- [ ] No raw SQL outside the \`db/\` directory" \
"phase-1,data,p0,todo"

create_issue \
"[P1-03] Zustand habit store" \
"## Overview
Implement the Zustand state store that wraps the SQLite DB layer and provides all habit and completion state to the UI.

## Context
The store is the single source of truth for the UI. It reads from SQLite on startup and keeps an in-memory mirror of all active habits and today's completions. All mutations write to SQLite first, then update in-memory state.

## File: \`store/habitStore.ts\`

## State shape
\`\`\`typescript
interface HabitStore {
  habits: Habit[]
  todayCompletions: Completion[]
  isLoading: boolean

  // Actions
  loadHabits: () => Promise<void>
  createHabit: (input: CreateHabitInput) => Promise<void>
  updateHabit: (id: string, input: Partial<CreateHabitInput>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  reorderHabits: (orderedIds: string[]) => Promise<void>
  markComplete: (habitId: string, note?: string) => Promise<void>
  loadTodayCompletions: () => Promise<void>
}
\`\`\`

## Business rules to enforce
- \`createHabit\`: reject if active habit count is already 5 — throw with message: \`'You have reached the 5-habit limit. Focus on mastering these first.'\`
- \`createHabit\`: reject if \`time_estimate_min\` is not 1–5
- \`markComplete\`: reject if habit already completed today
- \`loadHabits\`: called once on app startup, populates \`habits\` array

## Acceptance Criteria
- [ ] \`createHabit\` throws correct error when 5 habits already exist
- [ ] \`createHabit\` writes to SQLite and updates in-memory state
- [ ] \`markComplete\` inserts completion and updates \`todayCompletions\`
- [ ] \`markComplete\` rejects duplicate completion for same habit same day
- [ ] \`archiveHabit\` sets \`is_active = 0\` — habit disappears from active list
- [ ] \`reorderHabits\` updates \`sort_order\` for all habits in one operation
- [ ] All actions handle SQLite errors gracefully and log to console in dev" \
"phase-1,data,core,p0,todo"

create_issue \
"[P1-04] Home screen — daily check-in UI" \
"## Overview
Build the home screen — the daily check-in view. This is the most important screen in the app. Users open it once a day, check off their habits, and close it. It should feel fast, satisfying, and complete.

## Layout
\`\`\`
┌─────────────────────────────────┐
│  Saturday, March 21             │
│  'Small steps, big life.'       │
│                                 │
│  ○──────────────  3 / 5         │  ← completion ring
│                                 │
│  MORNING                        │
│  ┌─────────────────────────┐    │
│  │ 🧘 Meditate   5 min  ✓  │    │  ← completed (greyed)
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 💧 Drink water  1 min ○  │    │  ← not done
│  └─────────────────────────┘    │
│                                 │
│  EVENING                        │
│  ┌─────────────────────────┐    │
│  │ 📓 Journal    5 min  ○  │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
\`\`\`

## Components to build
- \`components/CompletionRing.tsx\` — SVG ring showing X/Y habits done today, animates on change
- \`components/HabitCard.tsx\` — shows emoji, name, time estimate, check button. Greys out when complete
- \`components/CheckButton.tsx\` — circular button, triggers haptic + bloom animation on tap
- \`components/DailyMessage.tsx\` — rotates through 365 curated messages, one per day (use day-of-year index)

## Behaviour
- Habits grouped by time_of_day: Morning → Afternoon → Evening
- Groups with no habits are hidden
- Check button calls \`habitStore.markComplete(habitId)\`
- Completed habits grey out immediately — no page reload needed
- Motivational message changes daily (not on every open — once per calendar day)

## Curated messages (add at least 30 to \`constants/messages.ts\` to start)
Examples: 'Small steps, big life.' / 'Done is better than perfect.' / 'Show up. That's it.' / 'Five minutes. Every day.'

## Acceptance Criteria
- [ ] Habits render grouped by time of day
- [ ] Groups with no habits are not shown
- [ ] Tapping CheckButton calls markComplete and card greys out immediately
- [ ] CompletionRing animates smoothly from previous to new ratio
- [ ] DailyMessage shows same message all day, changes at midnight
- [ ] Screen renders correctly with 1 habit and with 5 habits
- [ ] Empty state (no habits yet) shows prompt to add first habit
- [ ] Fully functional on both iOS and Android" \
"phase-1,ui,p0,todo"

create_issue \
"[P1-05] Habit creation and management screens" \
"## Overview
Build the habit creation form and habit management screens — the flow for adding, editing, and deleting habits.

## Screens

### Add Habit — accessible from home screen via '+' button

Fields:
- Name (text input, max 50 chars, required)
- Emoji picker (horizontal scroll of common emojis — at least 30 options, or allow any emoji input)
- Time estimate (segmented control: 1 min / 2 min / 3 min / 4 min / 5 min)
- Time of day (segmented control: Morning / Afternoon / Evening)
- Notify at (time picker — defaults to 7:00 AM / 12:00 PM / 7:00 PM based on time_of_day)

On submit:
- Call \`habitStore.createHabit()\`
- If 5-habit limit reached: show inline message — *'You have 5 habits. Focus on mastering these first.'* — no modal, no paywall, no upsell
- On success: navigate back to home screen

### Edit Habit — accessible from habit detail screen
- Same form as Add, pre-filled with existing values
- Calls \`habitStore.updateHabit()\` on save

### Delete Habit
- Confirmation alert: *'Delete [habit name]? This will remove all history.'*
- On confirm: calls \`habitStore.deleteHabit()\`
- Navigates back to home screen

### Habit Detail — \`app/habit/[id].tsx\`
- Current streak (flame icon + number)
- Longest streak
- 30-day completion percentage
- 12-week calendar heatmap (placeholder for Phase 2 — show empty grid now)
- Edit button → Edit Habit screen
- Delete button → confirmation alert

## Acceptance Criteria
- [ ] Add Habit form validates all required fields before submitting
- [ ] Time estimate rejects values outside 1–5 (segmented control prevents this naturally)
- [ ] At 5 active habits, tapping '+' shows the cap message — no crash, no paywall
- [ ] Emoji picker shows at least 30 options and allows selection
- [ ] Edit form pre-fills all existing habit values correctly
- [ ] Delete confirmation shows habit name in the message
- [ ] After delete, habit disappears from home screen immediately
- [ ] Habit detail shows current streak and longest streak from DB" \
"phase-1,ui,core,p0,todo"

echo "✓ Phase 1 issues created"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 2 — STREAKS & PROGRESS
# ══════════════════════════════════════════════════════════════════════════════
echo "Creating Phase 2 issues — Streaks & Progress..."

create_issue \
"[P2-01] Streak calculation engine" \
"## Overview
Implement the streak calculation algorithm as a pure utility function. This is the core business logic of the app and must be thoroughly tested.

## File: \`utils/streakCalculator.ts\`

## Algorithm
\`\`\`typescript
interface StreakResult {
  currentStreak: number
  longestStreak: number
  graceAvailable: boolean
  graceUsedAt: string | null  // ISO date string
}

async function calculateStreak(
  habitId: string,
  db: SQLiteDatabase
): Promise<StreakResult>
\`\`\`

### Step-by-step logic
1. Fetch all completions for \`habitId\` ordered by \`completed_date\` DESC
2. Determine start date: today if checked in today, else yesterday
3. Walk backwards day by day:
   - Date has completion → increment streak counter, continue
   - Date has no completion AND \`grace_used\` not in last 7 days → apply grace (use this slot), continue
   - Date has no completion AND grace already used in last 7 days → STOP, break
4. Return \`{ currentStreak, longestStreak, graceAvailable, graceUsedAt }\`

### Grace period rules
- Grace is available once every 7 days (rolling window)
- Grace used = a day in the window has a completion with \`grace_used = 1\`
- \`graceAvailable\` is true if no completion with \`grace_used = 1\` exists in the last 7 days

### Longest streak
- Computed in the same pass — track max streak seen across all historical completions

## Test cases (Jest)
- Streak of 0 (no completions)
- Streak of 1 (completed today only)
- Streak of 5 (5 consecutive days)
- Grace applied: day 1, 2, miss day 3, day 4 → streak = 4 (grace consumed)
- Grace exhausted: miss 2 consecutive days → streak breaks
- Grace window reset: miss day, use grace, 8 days later miss again → grace available again
- Longest streak correctly tracks across a break and rebuild

## Acceptance Criteria
- [ ] All 7 test cases pass with \`npx jest utils/streakCalculator\`
- [ ] Function is pure — no side effects, no direct DB calls (takes completions array as input)
- [ ] Returns correct \`graceAvailable\` boolean
- [ ] \`longestStreak\` correctly reflects historical maximum
- [ ] Handles empty completions array (streak = 0)
- [ ] No mutation of input array" \
"phase-2,core,data,p0,todo"

create_issue \
"[P2-02] Streak display and milestone celebrations" \
"## Overview
Wire up streak data to the UI and implement milestone celebration animations at key streak thresholds.

## Streak display
- \`HabitCard\` on home screen: show current streak number with 🔥 icon if streak ≥ 2
- Habit detail screen: show current streak prominently, longest streak below
- Streak = 0: show nothing (no flame, no zero)
- Streak = 1: show '1 day' with flame
- Grace day active: show streak in amber colour instead of green

## Milestone celebrations
Trigger a celebration when \`currentStreak\` hits: **7, 21, 30, 60, 100**

### Celebration implementation
- Use \`react-native-reanimated\` for a confetti burst effect
- Show a full-screen overlay for 2 seconds with:
  - Large streak number
  - Milestone label: '1 Week Streak! 🔥' / '3 Week Streak! 💪' / '1 Month Streak! 🌟' / etc.
  - Auto-dismisses after 2 seconds (no tap required)
- Trigger \`expo-haptics\` notificationAsync on milestone
- Store milestone seen in AsyncStorage — never show same milestone twice

## Acceptance Criteria
- [ ] Flame icon appears on HabitCard when streak ≥ 2
- [ ] Streak = 0 shows no streak indicator
- [ ] Grace day shows streak in amber
- [ ] Milestone overlay appears at 7, 21, 30, 60, 100 day streaks
- [ ] Milestone overlay auto-dismisses after 2 seconds
- [ ] Same milestone never shown twice (AsyncStorage flag)
- [ ] Haptic fires on milestone
- [ ] Celebration tested on both iOS and Android" \
"phase-2,ui,core,p1,todo"

create_issue \
"[P2-03] Progress screen — weekly summary and heatmap" \
"## Overview
Build the progress tab screen showing weekly completion rates per habit and a 12-week calendar heatmap.

## Screen: \`app/(tabs)/progress.tsx\`

## Layout
\`\`\`
┌──────────────────────────────────┐
│  This Week                       │
│  Overall: 74%                    │
│                                  │
│  Meditate    ████████░░  80%     │  ← bar per habit
│  Drink water ██████████  100%    │
│  Journal     ██████░░░░  60%     │
│                                  │
│  Last 12 Weeks                   │
│  Mo Tu We Th Fr Sa Su            │
│  ░  ░  ●  ●  ●  ░  ●            │  ← heatmap row
│  ●  ●  ●  ░  ●  ●  ●            │
│  ...                             │
└──────────────────────────────────┘
\`\`\`

## Components

### \`WeeklyBarChart\`
- One horizontal bar per active habit
- Bar width = (completions this week / 7) × 100%
- Colour: green (#4F7942) for ≥ 80%, amber for 50–79%, light grey for < 50%
- Show percentage label on right

### \`HeatmapCalendar\`
- 12 columns (weeks) × 7 rows (days Mon–Sun)
- Each cell coloured by completion on that date:
  - 0 habits completed → light grey (#EEEEEE)
  - Some habits completed → light green (#A8D5A2)
  - All habits completed → dark green (#4F7942)
- Today's cell has a border
- No labels needed on individual cells — just the day-of-week header row

### Data loading
- Query \`completions\` table for date range: today minus 84 days (12 weeks)
- Group by date, count completions per date
- Compare against total active habits for that date to determine fill intensity

## Acceptance Criteria
- [ ] Weekly bar chart renders correctly for all habits
- [ ] Percentages are accurate based on DB data
- [ ] Heatmap renders 12 weeks × 7 days grid
- [ ] Cell colours correctly reflect completion intensity
- [ ] Today's cell has a visible border or indicator
- [ ] Screen handles zero completions gracefully (all cells grey)
- [ ] Data refreshes when tab is focused (use \`useFocusEffect\`)" \
"phase-2,ui,data,p1,todo"

echo "✓ Phase 2 issues created"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 3 — NOTIFICATIONS & ONBOARDING
# ══════════════════════════════════════════════════════════════════════════════
echo "Creating Phase 3 issues — Notifications & Onboarding..."

create_issue \
"[P3-01] Push notifications — daily reminders" \
"## Overview
Implement daily local push notifications for each habit time group (Morning / Afternoon / Evening) using Expo Notifications.

## Context
Notifications are local only — no server, no FCM tokens needed for this feature. They are scheduled on-device at the user's configured reminder times. Notification delivery is critical to daily retention.

## File: \`hooks/useNotifications.ts\`

## Behaviour
- On app startup: request notification permissions (if not already granted)
- Schedule one daily notification per time group that has active habits:
  - Morning group → notify at user's morning time (default 7:00 AM)
  - Afternoon group → notify at user's afternoon time (default 12:00 PM)
  - Evening group → notify at user's evening time (default 7:00 PM)
- Notification content:
  - Morning: *'Good morning! Time for your morning habits 🌅'*
  - Afternoon: *'Afternoon check-in time 💪'*
  - Evening: *'Wind down with your evening habits 🌙'*
- If all habits in a time group are already completed for today: cancel that group's notification for today
- On habit completion: check if all habits in that group are done → cancel group notification if so
- Reschedule all notifications when habits are added, edited, or deleted

## Permission handling
- If permission denied: show a soft in-app banner — *'Enable notifications to get daily reminders'* — tapping opens device settings
- Never show a hard block or crash if permission denied
- Never ask for permission more than once per session

## Acceptance Criteria
- [ ] Permissions requested on first app launch
- [ ] Three daily notifications scheduled (one per active time group)
- [ ] Notification fires at correct time on iOS and Android
- [ ] Completing all habits in a group cancels that day's notification
- [ ] Notifications rescheduled when habits are added or deleted
- [ ] Denied permissions shows soft in-app banner — not a crash
- [ ] Notifications work when app is closed (background and killed state)
- [ ] No duplicate notifications scheduled on repeated app opens" \
"phase-3,core,ios,android,p0,todo"

create_issue \
"[P3-02] Onboarding flow — first-run experience" \
"## Overview
Build the 3-screen onboarding flow shown to users on first launch. No account creation. No email. Fast, friendly, and done in under 60 seconds.

## File: \`app/onboarding.tsx\`

## Screen 1 — Value prop
- Large headline: *'Five minutes. Every day. That's it.'*
- Subtext: *'MicroMoment keeps habits small so you actually do them.'*
- Single CTA button: *'Let's start →'*
- Background: brand green gradient

## Screen 2 — Create first habit
- Heading: *'What's one thing you want to do every day?'*
- Suggestion chips (horizontal scroll):
  - 💧 Drink water · 🧘 Stretch · 🧠 Meditate · 📓 Journal · 🚶 Walk outside
- Tapping a chip pre-fills the habit name input
- Name input (text field, max 50 chars)
- Time estimate: segmented control (1–5 min)
- Time of day: segmented control (Morning / Afternoon / Evening)
- CTA: *'Add this habit →'* — disabled until name is filled

## Screen 3 — Set reminder
- Heading: *'When should we remind you?'*
- Three time pickers (show only the groups relevant to habit created in Screen 2):
  - Morning reminder (default 7:00 AM)
  - Afternoon reminder (default 12:00 PM)
  - Evening reminder (default 7:00 PM)
- CTA: *'Start building →'*
- On tap: save reminder times, create the habit from Screen 2, set \`onboarding_complete\` flag in AsyncStorage, navigate to home screen

## Rules
- Skip button on Screen 1 and 2 (not Screen 3) — skipping skips to home with no habits created
- Onboarding never shown again after \`onboarding_complete\` flag is set
- \`_layout.tsx\` checks AsyncStorage on startup — redirects to onboarding if flag not set

## Acceptance Criteria
- [ ] Onboarding shown on fresh install (no AsyncStorage flag)
- [ ] Onboarding not shown on subsequent launches
- [ ] Tapping suggestion chip pre-fills name input
- [ ] CTA on Screen 2 disabled until name is entered
- [ ] Habit created in Screen 2 appears on home screen after onboarding
- [ ] Reminder times saved correctly to each habit's \`notify_time\`
- [ ] Skip on Screen 1 goes to home with no habits — no crash
- [ ] Renders correctly on small screen (iPhone SE, 375px)" \
"phase-3,ui,core,p0,todo"

echo "✓ Phase 3 issues created"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 4 — POLISH & RELEASE
# ══════════════════════════════════════════════════════════════════════════════
echo "Creating Phase 4 issues — Polish & Release..."

create_issue \
"[P4-01] Animations and haptics polish" \
"## Overview
Add the micro-animations and haptic feedback that make the app feel premium. These are the moments that drive retention — the satisfying tap, the streak celebration, the smooth transitions.

## Animations (react-native-reanimated)

### CheckButton bloom
- On tap: button scales up to 1.3× then back to 1.0 over 300ms
- Simultaneously: checkmark icon fades in, circle fills with green
- HabitCard: opacity animates from 1.0 to 0.5 over 200ms (completed state)
- Easing: spring animation for natural feel

### CompletionRing
- On each new completion: ring progress animates smoothly to new value over 500ms
- Use \`withTiming\` with \`Easing.out(Easing.cubic)\`

### Milestone celebration overlay
- Entry: scale from 0.8 to 1.0 + fade in over 300ms
- Exit: fade out over 200ms after 2 second hold
- Confetti: use \`react-native-confetti-cannon\` or hand-rolled particle effect with Reanimated

### Screen transitions
- Tab transitions: default Expo Router transitions are fine
- Modal sheets (add habit, edit): slide up from bottom

## Haptics (expo-haptics)
- CheckButton tap → \`impactAsync(ImpactFeedbackStyle.Light)\`
- Milestone reached → \`notificationAsync(NotificationFeedbackType.Success)\`
- Drag-to-reorder habit → \`impactAsync(ImpactFeedbackStyle.Medium)\` on pick-up
- Delete confirmation → \`impactAsync(ImpactFeedbackStyle.Heavy)\`

## Acceptance Criteria
- [ ] CheckButton bloom animation plays on every completion
- [ ] HabitCard greys out with animation (not instant)
- [ ] CompletionRing animates smoothly — no jump
- [ ] Milestone overlay enters and exits with animation
- [ ] All 4 haptic triggers fire on correct actions
- [ ] Haptics work on iOS (not available on Android simulator — test on real device)
- [ ] Animations run at 60fps — no dropped frames on 3-year-old mid-range device
- [ ] All animations respect iOS Reduce Motion accessibility setting" \
"phase-4,ui,ios,android,p1,todo"

create_issue \
"[P4-02] Drag-to-reorder habits" \
"## Overview
Allow users to reorder their habits on the home screen via drag-and-drop. Order is persisted to SQLite via \`sort_order\`.

## Implementation
- Use \`react-native-drag-sort\` or implement with \`react-native-reanimated\` + \`react-native-gesture-handler\`
- Long-press on a HabitCard activates drag mode — card lifts slightly (shadow + scale 1.02)
- Drag up/down to reorder within the same time group
- Habits cannot be dragged between time groups (Morning stays in Morning)
- On drop: call \`habitStore.reorderHabits(orderedIds)\` which updates \`sort_order\` for all affected habits in one DB write
- Haptic: \`impactAsync(Medium)\` on pick-up

## Acceptance Criteria
- [ ] Long-press activates drag on HabitCard
- [ ] Card lifts visually during drag
- [ ] Reorder persists after app restart (sort_order saved to DB)
- [ ] Habits cannot be dragged between time groups
- [ ] Haptic fires on drag activation
- [ ] Works with 2 habits and with 5 habits
- [ ] No jank or dropped frames during drag on mid-range Android" \
"phase-4,ui,p2,todo"

create_issue \
"[P4-03] Settings screen" \
"## Overview
Build the settings screen accessible from the tab bar. Minimal — only what's needed.

## Screen: \`app/(tabs)/settings.tsx\`

## Sections

### Notifications
- Toggle: Enable reminders (on/off)
- Morning reminder time picker
- Afternoon reminder time picker
- Evening reminder time picker
- Changes trigger re-scheduling of all notifications

### Habits
- Link to full habit list with edit/archive/reorder capability
- 'Archived Habits' section — shows archived habits with option to restore (restore only if active count < 5)

### App
- App version (from \`expo-application\`)
- 'Rate MicroMoment' → opens App Store / Play Store rating prompt
- 'Send Feedback' → opens mailto link
- 'Privacy Policy' → opens URL in in-app browser

### Data
- 'Reset all data' — confirmation alert: *'This will delete all habits and history. This cannot be undone.'* — calls full DB wipe and resets onboarding flag

## Acceptance Criteria
- [ ] Notification toggles correctly reschedule/cancel notifications
- [ ] Time pickers update reminder times and persist to DB
- [ ] Archived habits list shows all habits with \`is_active = 0\`
- [ ] Restore archived habit fails gracefully if at 5-habit limit
- [ ] Reset all data wipe is behind a double-confirmation
- [ ] App version displays correctly on both platforms
- [ ] Rate prompt works on iOS (SKStoreReviewRequest) and Android (In-App Review API)" \
"phase-4,ui,p1,todo"

create_issue \
"[P4-04] Accessibility and cross-platform QA" \
"## Overview
Ensure MicroMoment meets WCAG 2.1 AA accessibility standards and passes manual QA across target devices and screen sizes.

## Accessibility Requirements
- All interactive elements have accessible labels (\`accessibilityLabel\` prop)
- Minimum contrast ratio 4.5:1 for all text (check with Accessibility Inspector)
- Dynamic Type supported — UI does not break at Accessibility Extra Large font size
- VoiceOver (iOS) can navigate all screens and trigger all actions
- TalkBack (Android) can navigate all screens and trigger all actions
- Animations respect \`AccessibilityInfo.isReduceMotionEnabled()\` — skip or simplify if true

## Device QA Matrix
| Device | OS | Screen |
|--------|----|--------|
| iPhone SE 3rd gen | iOS 16 | 375×667 |
| iPhone 15 | iOS 17 | 393×852 |
| iPhone 15 Pro Max | iOS 17 | 430×932 |
| Pixel 6a | Android 13 | 1080×2400 |
| Samsung Galaxy S23 | Android 13 | 1080×2340 |
| Mid-range Android (e.g. Moto G) | Android 12 | 720×1600 |

## QA Checklist
- [ ] All screens render correctly at 375px width (iPhone SE)
- [ ] All screens render correctly at 430px width (iPhone 15 Pro Max)
- [ ] Dynamic Type Extra Large does not break any layout
- [ ] VoiceOver completes a full check-in flow without getting stuck
- [ ] TalkBack completes a full check-in flow without getting stuck
- [ ] Contrast ratio ≥ 4.5:1 on all text elements
- [ ] App cold start < 1.5 seconds on Moto G (mid-range Android)
- [ ] No layout overflow or clipped text on any tested device
- [ ] Dark mode renders correctly on both platforms

## Acceptance Criteria
- [ ] All items in QA checklist above checked off
- [ ] Zero P0 accessibility issues
- [ ] Cold start time measured and documented" \
"phase-4,testing,ios,android,p1,todo"

create_issue \
"[P4-05] Jest unit test suite" \
"## Overview
Write unit tests for all business logic. Target >90% coverage on \`utils/\` and \`store/\`.

## Test files

### \`utils/streakCalculator.test.ts\`
(See P2-01 for full test case list — implement all 7 cases)

### \`store/habitStore.test.ts\`
- Create habit with valid data → inserted in DB and in-memory state
- Create habit with \`time_estimate_min = 6\` → throws error
- Create 5 habits then attempt 6th → throws '5-habit limit' error
- \`markComplete\` for already-completed habit → throws duplicate error
- \`archiveHabit\` → habit removed from active list, still in DB with \`is_active = 0\`
- \`reorderHabits\` → \`sort_order\` updated correctly for all habits

### \`db/completions.test.ts\`
- \`getTodayCompletions\` returns only today's completions
- \`getCompletionsByDateRange\` returns correct range
- Cascade delete: deleting habit removes its completions

## Setup
- Use Jest with \`jest-expo\` preset
- Mock Expo SQLite with \`jest-expo\` mocks
- Mock \`expo-haptics\` and \`expo-notifications\`

## Acceptance Criteria
- [ ] \`npx jest\` passes with zero failures
- [ ] Coverage report shows >90% on \`utils/\` and \`store/\`
- [ ] All streak calculator test cases implemented
- [ ] All habit store test cases implemented
- [ ] No real SQLite DB created during tests (mocked)" \
"phase-4,testing,p0,todo"

create_issue \
"[P4-06] Sentry and PostHog integration" \
"## Overview
Wire up Sentry for crash monitoring and PostHog for anonymous analytics. Both must be configured to collect zero personally identifiable information.

## Sentry
- Initialise in \`app/_layout.tsx\` using \`Sentry.wrap()\` around root component
- Load DSN from \`SENTRY_DSN\` environment variable
- Capture JS errors and native crashes
- Source maps uploaded via EAS Build (configure in \`eas.json\`)
- Do NOT log: habit names, notes, or any user-entered text
- DO log: crash stack traces, screen names, app version, platform

## PostHog
- Initialise with anonymous user ID (generated UUID stored in AsyncStorage — never changes, never tied to identity)
- Track these events only:
  - \`habit_created\` → props: \`{ time_of_day, time_estimate_min }\` (no habit name)
  - \`habit_completed\` → props: \`{ time_of_day, streak_length }\`
  - \`streak_milestone\` → props: \`{ milestone: 7 | 21 | 30 | 60 | 100 }\`
  - \`onboarding_completed\` → props: \`{ habit_count: 1 }\`
  - \`app_opened\` → props: \`{ habits_active }\`
- No screen tracking, no user properties, no IP addresses

## Acceptance Criteria
- [ ] Sentry receives a test error on first launch (trigger manually in dev)
- [ ] Sentry stack traces show original TypeScript source lines (source maps working)
- [ ] PostHog receives \`app_opened\` event on each launch
- [ ] PostHog events contain no habit names, notes, or PII
- [ ] Anonymous user ID is consistent across app restarts
- [ ] Both integrations disabled in test environment (\`NODE_ENV === 'test'\`)" \
"phase-4,core,p1,todo"

create_issue \
"[P4-07] EAS Build and App Store / Play Store release" \
"## Overview
Configure EAS Build and submit the app to both the Apple App Store and Google Play Store.

## EAS Setup
- Install EAS CLI: \`npm install -g eas-cli\`
- Login: \`eas login\`
- Configure: \`eas build:configure\` → generates \`eas.json\`
- Configure three build profiles in \`eas.json\`: \`development\`, \`preview\`, \`production\`

## iOS Release
1. Create app in App Store Connect at https://appstoreconnect.apple.com
   - Bundle ID: \`com.nav1885.micromoment\`
   - App name: MicroMoment: 5-Min Habit Tracker
2. Build: \`eas build --platform ios --profile production\`
3. Submit: \`eas submit --platform ios --latest\`
4. App Store listing:
   - Subtitle: *Tiny habits. Real streaks.*
   - Category: Health & Fitness
   - Keywords: habit tracker, daily routine, streak, micro habits, 5 minute
   - Screenshots required: 6.9\", 6.5\", 5.5\", iPad 12.9\"
   - Privacy: Data Not Collected
5. TestFlight: upload build, invite 5–10 testers, run for 1 week before production submit

## Android Release
1. Create app in Google Play Console at https://play.google.com/console
   - Package name: \`com.nav1885.micromoment\`
2. Build: \`eas build --platform android --profile production\`
3. Submit: \`eas submit --platform android --latest\`
4. Play Store listing:
   - Short description: *Build habits in under 5 minutes a day.*
   - Category: Health & Fitness
   - Screenshots required: phone (16:9), 7\" tablet, 10\" tablet
   - Data Safety: No data collected, no data shared
5. Start at 20% production rollout, monitor crash rate for 48 hours, expand to 100%

## Acceptance Criteria
- [ ] \`eas.json\` configured with development, preview, production profiles
- [ ] iOS production build succeeds: \`eas build --platform ios --profile production\`
- [ ] Android production build succeeds: \`eas build --platform android --profile production\`
- [ ] App passes App Store review
- [ ] App passes Google Play review
- [ ] TestFlight build tested by at least 3 real users
- [ ] Android 20% rollout shows crash-free rate > 99.5% before expanding
- [ ] App Store listing has all required screenshots and metadata" \
"phase-4,devops,ios,android,p0,todo"

create_issue \
"[P4-08] CI/CD — GitHub Actions" \
"## Overview
Set up GitHub Actions for automated testing and type checking on every push and pull request.

## Workflows

### \`.github/workflows/test.yml\`
Trigger: push to any branch, PR to \`main\`
Steps:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies: \`npm ci\`
4. Run TypeScript check: \`tsc --noEmit\`
5. Run Jest tests: \`npx jest --coverage\`
6. Upload coverage report as artifact

### \`.github/workflows/expo-check.yml\`
Trigger: PR to \`main\` only
Steps:
1. Checkout code
2. Install EAS CLI
3. Run \`npx expo-doctor\` — checks for common Expo config issues
4. Run \`eas build --platform all --profile preview --non-interactive --no-wait\`
   (triggers EAS cloud build without waiting — confirms build config is valid)

## Branch protection rules (set via script)
- \`main\` branch requires passing \`test.yml\` before merge
- Direct push to \`main\` disabled — all changes via PR

## Acceptance Criteria
- [ ] \`test.yml\` runs on every push — visible in GitHub Actions tab
- [ ] PR to main blocked if tests fail
- [ ] Coverage report uploaded as artifact on each run
- [ ] \`expo-doctor\` check runs on PRs to main
- [ ] Status badges added to README.md
- [ ] Branch protection rules active on \`main\`" \
"phase-4,devops,p1,todo"

echo "✓ Phase 4 issues created"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
echo "=========================================="
echo " Setup Complete!"
echo "=========================================="
echo ""
echo " Labels created:"
echo "   Phase    : phase-1, phase-2, phase-3, phase-4"
echo "   Type     : core, ui, data, testing, devops, ios, android"
echo "   Priority : p0, p1, p2"
echo "   Status   : todo, in-progress, done"
echo ""
echo " Issues created:"
echo "   PRD                              : 1 issue  (full requirements doc)"
echo "   Phase 1 — Foundation & Core Loop : 5 issues"
echo "   Phase 2 — Streaks & Progress     : 3 issues"
echo "   Phase 3 — Notifications & Onboarding : 2 issues"
echo "   Phase 4 — Polish & Release       : 8 issues"
echo "   Total                            : 19 issues"
echo ""
echo " Recommended start order:"
echo "   1. Read the PRD issue (#1) — full product requirements"
echo "   2. P1-01 — Expo scaffold"
echo "   3. P1-02 — SQLite schema"
echo "   4. P1-03 — Zustand store"
echo "   5. P1-04 — Home screen"
echo "   6. P1-05 — Habit creation"
echo "   Then Phase 2 → 3 → 4 sequentially"
echo ""
echo " Next steps:"
echo "   1. Verify issues at https://github.com/nav1885/MicroMoment/issues"
echo "   2. Connect repo to ZenHub"
echo "   3. Open Claude Code and start with P1-01"
echo ""
echo " Happy building, Naveen!"
