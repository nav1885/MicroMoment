export interface StreakResult {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
}

function getPreviousDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() - 1)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Calculate streak stats from an array of completion date strings (YYYY-MM-DD).
 *
 * currentStreak: consecutive days ending today OR yesterday (so the streak is
 * not broken before the user has had a chance to complete today's habit).
 *
 * longestStreak: the longest consecutive run in the full history.
 *
 * @param completedDates - Array of YYYY-MM-DD strings, order and duplicates don't matter.
 * @param today - Override today's date (YYYY-MM-DD) — defaults to the local date.
 */
export function calculateStreak(
  completedDates: string[],
  today: string = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time
): StreakResult {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 }
  }

  // Deduplicate, sort descending
  const uniqueDates = [...new Set(completedDates)].sort().reverse()
  const totalCompletions = uniqueDates.length
  const dateSet = new Set(uniqueDates)

  // Current streak — anchor on today or yesterday
  let currentStreak = 0
  const anchor = dateSet.has(today) ? today : getPreviousDate(today)
  if (dateSet.has(anchor)) {
    let cursor = anchor
    while (dateSet.has(cursor)) {
      currentStreak++
      cursor = getPreviousDate(cursor)
    }
  }

  // Longest streak — scan the sorted-descending list
  let longestStreak = 1
  let runLength = 1
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    if (getPreviousDate(uniqueDates[i]) === uniqueDates[i + 1]) {
      runLength++
    } else {
      longestStreak = Math.max(longestStreak, runLength)
      runLength = 1
    }
  }
  longestStreak = Math.max(longestStreak, runLength)

  return { currentStreak, longestStreak, totalCompletions }
}
