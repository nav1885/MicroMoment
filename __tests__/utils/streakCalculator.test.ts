import { calculateStreak } from '../../utils/streakCalculator'

describe('calculateStreak', () => {
  test('returns zeros for empty input', () => {
    const result = calculateStreak([], '2026-03-22')
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0, totalCompletions: 0 })
  })

  test('single completion today → streak of 1', () => {
    const result = calculateStreak(['2026-03-22'], '2026-03-22')
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1, totalCompletions: 1 })
  })

  test('3 consecutive days ending today → currentStreak = 3', () => {
    const dates = ['2026-03-22', '2026-03-21', '2026-03-20']
    const result = calculateStreak(dates, '2026-03-22')
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
    expect(result.totalCompletions).toBe(3)
  })

  test('streak ending yesterday is preserved (user hasnt done today yet)', () => {
    const dates = ['2026-03-21', '2026-03-20', '2026-03-19']
    const result = calculateStreak(dates, '2026-03-22')
    expect(result.currentStreak).toBe(3)
  })

  test('broken streak: only today and 5 days ago → currentStreak = 1', () => {
    const dates = ['2026-03-22', '2026-03-17']
    const result = calculateStreak(dates, '2026-03-22')
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
    expect(result.totalCompletions).toBe(2)
  })

  test('correctly identifies longest streak across two separate runs', () => {
    // Run 1: 3 days (Mar 10–12), Run 2: 5 days (Mar 17–21), today is Mar 22 (not done)
    const dates = [
      '2026-03-21', '2026-03-20', '2026-03-19', '2026-03-18', '2026-03-17',
      '2026-03-12', '2026-03-11', '2026-03-10',
    ]
    const result = calculateStreak(dates, '2026-03-22')
    expect(result.currentStreak).toBe(5) // anchored to yesterday (Mar 21)
    expect(result.longestStreak).toBe(5)
    expect(result.totalCompletions).toBe(8)
  })

  test('duplicate dates in input are counted once', () => {
    const dates = ['2026-03-22', '2026-03-22', '2026-03-21']
    const result = calculateStreak(dates, '2026-03-22')
    expect(result.totalCompletions).toBe(2)
    expect(result.currentStreak).toBe(2)
  })

  test('unsorted input still produces correct result', () => {
    const dates = ['2026-03-20', '2026-03-22', '2026-03-21'] // intentionally out of order
    const result = calculateStreak(dates, '2026-03-22')
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
  })
})
