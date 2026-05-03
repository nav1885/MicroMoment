# MicroMoment — Design Specification

## 1. Design tokens

### 1.1 Colors (`constants/colors.ts`)

**Light**
| Token | Hex |
|---|---|
| background | #F8F8F6 |
| surface | #FFFFFF |
| text | #1A1A1A |
| textSecondary | #6B6B6B |
| primary | #34A853 |
| primaryLight | #A8D5A2 |
| border | #E5E5E5 |
| cardBackground | #FFFFFF |
| completedCard | #F0F0F0 |
| completedText | #AAAAAA |
| streak | #FF9F0A |
| amber | #E8A020 |
| danger | #FF3B30 |
| sectionHeader | #9E9E9E |
| checkActive | #34A853 |
| checkInactive | #E5E5E5 |
| ringBackground | #E5E5E5 |
| ringFill | #34A853 |

**Dark** — same semantic tokens with adjusted values (background #121212, surface #1E1E1E, text #F5F5F5, textSecondary #A0A0A0, primaryLight #1E6E36, border #2C2C2C, etc.). Primary green (#34A853) and danger red (#FF3B30) are shared.

**Heatmap scale** — semantic tokens `heatmap0`…`heatmap4` (light → full intensity).
- Light: #F0F4FF → #C7DCFF → #8DB8FF → #4285F4 → #0A84FF
- Dark:  #1A1F2E → #1E3A5F → #1A5CA8 → #1A7FE8 → #0A84FF

### 1.2 Typography (`constants/typography.ts`)

| Style | Size | Weight | Tracking |
|---|---|---|---|
| title | 28 | 700 | -0.5 |
| body | 16 | 500 | — |
| secondary | 14 | 400 | — |
| label | 12 | 600 | 0.5 |
| caption | 11 | 500 | — |

System font (no custom font loading).

### 1.3 Spacing

- Screen horizontal padding: 20
- Card padding: 14–16
- Section gaps: 8 / 12 / 20 / 28

### 1.4 Elevation

Card shadow (iOS): offset (0, 1), opacity 0.06, radius 4. Android `elevation: 2`.

### 1.5 Radii

- Cards: 14
- Buttons: 14
- Pills (time-of-day, offset): pill / fully rounded

## 2. Component system

### 2.1 Button (`components/Button.tsx`)
Variants: **primary**, **secondary**, **danger**, **ghost**. Height 56 (ghost overrides padding to 8 vertical). Border radius 14. Disabled state opacity 0.45. Optional inline loading spinner. All variants wrap `AnimatedPressable`.

### 2.2 AnimatedPressable
Scale-to-0.96 on press-in, spring back on release. Optional `Haptics.Light` impact. Skips animation and haptic when `AccessibilityInfo.isReduceMotionEnabled()` is true.

### 2.3 HabitCard
Row with emoji, name, meta (duration · time-of-day), 🔥 streak badge (when ≥ 2), drag handle (⋮⋮), and CheckButton. Wrapped in `Swipeable`; right actions reveal Edit (green) and Delete (red). Long-press (400ms) opens swipe menu. When completed today: opacity 0.45 and `completedText` color.

### 2.4 CheckButton
Circle 40×40. Inactive border (`checkInactive`), active fill (`checkActive`) with white ✓. Spring scale 1 → 1.3 → 1 on tap; haptic.

### 2.5 CompletionRing
SVG ring; background (`ringBackground`) + animated foreground stroke (`ringFill`) driven by Reanimated. Centered numeric counter.

### 2.6 DailyMessage
Single-line text component reading from the 321-message pool indexed by day-of-year.

### 2.7 EmojiPicker
Grid of 40 curated emoji. Selected emoji has primary border/background.

### 2.8 ReminderModal
Bottom-style modal with hour/minute incrementers and a row of offset pills (At time / 15 min / 30 min / 1 hr / 2 hrs before). Cancel / Set actions.

## 3. Screens

### 3.1 Onboarding (`app/onboarding.tsx`)
Full-screen primary-green background. Horizontal `FlatList` (scrollEnabled: false). 3 slides with title + subtitle. Bottom: dot indicators + Next button (becomes "Get Started" on last slide). Skip button top-right.

### 3.2 Today (`app/(tabs)/index.tsx`)
- Header: date string + DailyMessage.
- Body: `DraggableFlatList` of HabitCards.
- List header: drag hint (`Hold to reorder`, ≥ 2 habits).
- List footer: **Add Habit** button — full-width, primary-tinted background (`primary + '12'`), `+` icon + label, lives below the list (not in the nav header). Better thumb reach than a header FAB. At the 5-habit cap: opacity 0.4, no haptic, transparent fill, secondary-text color, `accessibilityState.disabled = true`.
- Empty state: friendly prompt + the same Add Habit footer button.
- Confetti overlay on milestone streak completion.

### 3.3 Progress (`app/(tabs)/progress.tsx`)
- Last 7 days summary card: dot strip + count.
- Per-habit stats: emoji, name, current streak, longest streak, total completions.
- 8-week heatmap: 8 rows × 7 cols (Mon-anchored). Week labels (e.g. "Jan 15") left-aligned.

### 3.4 Settings (`app/(tabs)/settings.tsx`)
- Archived Habits section: rows with emoji + name + Restore.
- About section: version, Reset Onboarding action.

### 3.5 New Habit (`app/habit/new.tsx`)
Modal. Fields top-to-bottom: EmojiPicker, name TextInput, time-of-day pills, duration stepper (−/+ around minute count), Reminder row (opens ReminderModal). Header: Close (left), Save (right; "Saving…" while loading). `KeyboardAvoidingView` on iOS.

### 3.6 Habit Detail / Edit (`app/habit/[id].tsx`)
- View mode: hero emoji, name, meta, "Mark Complete" primary button. Header Edit button.
- Edit mode (`?mode=edit` or via Edit button): same form as New Habit + danger zone (Archive, Delete with confirmation alerts). Header Save / Cancel.
- Falls back to "not found" state if habit was deleted while open.

## 4. Navigation

- Root stack (`app/_layout.tsx`): `(tabs)`, `onboarding` (modal, no swipe-down), `habit/[id]` (card), `habit/new` (modal). Headers hidden globally.
- Tabs (`app/(tabs)/_layout.tsx`): three bottom tabs — Today (✓), Progress (▦), Settings (⚙). Active tint = primary; inactive = textSecondary.
- Onboarding gate: `_layout.tsx` reads `onboarding_complete` and routes to `/onboarding` if absent.

## 5. Interaction patterns

| Pattern | Where | Behavior |
|---|---|---|
| Tap | Buttons, check, list rows | scale 0.96 + haptic |
| Long-press | HabitCard | 400ms → opens swipe actions |
| Swipe left | HabitCard | reveals Edit / Delete |
| Drag (long-press handle) | HabitCard | reorders, persists `sort_order` |
| Pull-to-refresh | none | not implemented |
| Confetti | milestone completion | 120 particles, 3000ms fall, top-center origin |
| Disabled state | over-cap, in-flight save | opacity 0.45, no haptic |

## 6. Accessibility

- Reduce-motion respected: animations and haptics gated by `AccessibilityInfo.isReduceMotionEnabled()`.
- Color contrast: text/textSecondary against background/surface meet WCAG AA in both themes.
- Tap targets ≥ 40×40 (CheckButton, tab icons, drag handle).
- Touchables expose accessible labels (habit name, action verbs).

## 7. Iconography

- Tab icons: emoji glyphs (✓ ▦ ⚙).
- In-content icons: `@expo/vector-icons` Ionicons (drag handle, settings rows).
- Emoji as primary "icon" language for habits — chosen by user from 40-emoji palette.

## 8. Motion

- Reanimated 4 spring physics for press feedback and CheckButton scale.
- CompletionRing stroke animates linearly to target progress.
- Confetti via `react-native-confetti-cannon`.
- All motion bypassed under reduce-motion.
