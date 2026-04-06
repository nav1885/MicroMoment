import {
  requestNotificationPermission,
  scheduleHabitNotification,
  cancelHabitNotification,
  rescheduleAllNotifications,
} from '../../utils/notifications'
import type { Habit } from '../../db/habits'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Morning stretch',
    emoji: '🧘',
    time_of_day: 'morning',
    time_estimate_min: 5,
    sort_order: 0,
    is_active: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    reminder_time: null,
    reminder_offset_min: null,
    ...overrides,
  }
}

describe('requestNotificationPermission', () => {
  test('returns true when permission is already granted', async () => {
    const result = await requestNotificationPermission()
    expect(result).toBe(true)
  })
})

describe('scheduleHabitNotification', () => {
  test('resolves without error for habit with no reminder', async () => {
    await expect(scheduleHabitNotification(makeHabit())).resolves.toBeUndefined()
  })

  test('schedules a notification for habit with reminder_time', async () => {
    const { scheduleNotificationAsync } = require('expo-notifications')
    scheduleNotificationAsync.mockClear()

    await scheduleHabitNotification(makeHabit({ reminder_time: '08:00', reminder_offset_min: 0 }))

    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1)
  })

  test('applies offset when scheduling', async () => {
    const { scheduleNotificationAsync } = require('expo-notifications')
    scheduleNotificationAsync.mockClear()

    await scheduleHabitNotification(makeHabit({ reminder_time: '08:30', reminder_offset_min: 30 }))

    const call = scheduleNotificationAsync.mock.calls[0][0]
    expect(call.trigger.hour).toBe(8)
    expect(call.trigger.minute).toBe(0)
  })

  test('clamps offset that would go below midnight', async () => {
    const { scheduleNotificationAsync } = require('expo-notifications')
    scheduleNotificationAsync.mockClear()

    await scheduleHabitNotification(makeHabit({ reminder_time: '00:10', reminder_offset_min: 30 }))

    const call = scheduleNotificationAsync.mock.calls[0][0]
    expect(call.trigger.hour).toBe(0)
    expect(call.trigger.minute).toBe(0)
  })
})

describe('cancelHabitNotification', () => {
  test('resolves without error', async () => {
    await expect(cancelHabitNotification('h1')).resolves.toBeUndefined()
  })
})

describe('rescheduleAllNotifications', () => {
  test('resolves without error for empty list', async () => {
    await expect(rescheduleAllNotifications([])).resolves.toBeUndefined()
  })

  test('only schedules habits with reminder_time set', async () => {
    const { scheduleNotificationAsync } = require('expo-notifications')
    scheduleNotificationAsync.mockClear()

    const habits = [
      makeHabit({ id: 'h1', reminder_time: '07:00', reminder_offset_min: 0 }),
      makeHabit({ id: 'h2', reminder_time: null }),
    ]
    await rescheduleAllNotifications(habits)

    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1)
  })
})
