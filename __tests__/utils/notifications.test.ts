import {
  requestNotificationPermission,
  scheduleHabitReminders,
  cancelAllHabitReminders,
} from '../../utils/notifications'

const mockHabits = [
  {
    id: 'h1',
    name: 'Morning stretch',
    emoji: '🧘',
    time_of_day: 'morning' as const,
    time_estimate_min: 5,
    sort_order: 0,
    is_active: 1,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'h2',
    name: 'Evening read',
    emoji: '📚',
    time_of_day: 'evening' as const,
    time_estimate_min: 5,
    sort_order: 1,
    is_active: 1,
    created_at: '2026-01-01T00:00:00.000Z',
  },
]

const mockTimes = {
  morning: '07:00',
  afternoon: '12:00',
  evening: '19:00',
}

describe('requestNotificationPermission', () => {
  test('returns true when permission is already granted', async () => {
    const result = await requestNotificationPermission()
    expect(result).toBe(true)
  })
})

describe('scheduleHabitReminders', () => {
  test('resolves without error', async () => {
    await expect(scheduleHabitReminders(mockTimes, mockHabits)).resolves.toBeUndefined()
  })

  test('does not schedule notifications for groups with no habits', async () => {
    const { scheduleNotificationAsync } = require('expo-notifications')
    scheduleNotificationAsync.mockClear()

    // Only morning and evening habits — afternoon group is empty
    await scheduleHabitReminders(mockTimes, mockHabits)

    // Should have scheduled exactly 2 (morning + evening), not 3
    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(2)
  })

  test('handles empty habits list gracefully', async () => {
    await expect(scheduleHabitReminders(mockTimes, [])).resolves.toBeUndefined()
  })
})

describe('cancelAllHabitReminders', () => {
  test('resolves without error', async () => {
    await expect(cancelAllHabitReminders()).resolves.toBeUndefined()
  })
})
